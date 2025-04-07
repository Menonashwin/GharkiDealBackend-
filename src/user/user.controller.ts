import {
  Controller,
  Get,
  Put,
  Body,
  Post,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUserPayload } from '../auth/interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileUpdateDto, ProfileResponseDto } from './dto/profile-update.dto';

@ApiBearerAuth('access-token')
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: ProfileResponseDto,
  })
  async getProfile(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<Partial<User>> {
    const userProfile = await this.userService.findById(user.sub);

    if (!userProfile) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields from response
    const { access_token, otp, ...result } = userProfile.get({ plain: true });
    return result;
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: ProfileResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() updateUserDto: any,
  ): Promise<Partial<User>> {
    try {
      // Log the incoming data
      console.log('Updating profile with data:', updateUserDto);

      // Add validation to ensure the data is in the expected format
      if (typeof updateUserDto !== 'object') {
        throw new BadRequestException('Invalid update data format');
      }

      const updatedUser = await this.userService.updateUser(
        user.sub,
        updateUserDto,
      );

      // Remove sensitive fields from response
      const { access_token, otp, ...result } = updatedUser.get({ plain: true });

      console.log('Profile updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update profile: ' + error.message,
      );
    }
  }

  @Post('complete-profile')
  @ApiOperation({ summary: 'Complete user profile setup' })
  @ApiResponse({
    status: 200,
    description: 'Profile completed successfully',
    type: ProfileResponseDto,
  })
  async completeProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() profileData: ProfileUpdateDto,
  ): Promise<Partial<User>> {
    try {
      const updatedUser = await this.userService.completeProfile(
        user.sub,
        profileData,
      );

      // Remove sensitive fields from response
      const { access_token, otp, ...result } = updatedUser.get({ plain: true });
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to complete profile: ' + error.message,
      );
    }
  }

  @Get('profile-status')
  @ApiOperation({ summary: 'Check if user profile is complete' })
  @ApiResponse({ status: 200, description: 'Profile status' })
  async checkProfileStatus(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<{ is_complete: boolean }> {
    const isComplete = await this.userService.isProfileComplete(user.sub);
    return { is_complete: isComplete };
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Check if phone number exists' })
  @ApiResponse({ status: 200, description: 'Phone number status' })
  async checkPhoneExists(
    @Body('ph_no') phone: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.userService.checkPhoneExists(phone);
    return { exists };
  }
}
