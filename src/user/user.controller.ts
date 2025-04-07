import { Controller, Get, Put, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { UserResponseDto } from '../auth/dto/phone-auth.dto';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtUserPayload } from '../auth/interfaces/user.interface';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth('access-token')
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getProfile(@CurrentUser() user: JwtUserPayload): Promise<Partial<User>> {
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
  @ApiResponse({ status: 200, description: 'User profile updated', type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Partial<User>> {
    const updatedUser = await this.userService.updateUser(user.sub, updateUserDto);
    
    // Remove sensitive fields from response
    const { access_token, otp, ...result } = updatedUser.get({ plain: true });
    return result;
  }
  
  @Get('phone/:phone')
  @ApiOperation({ summary: 'Check if phone number exists' })
  @ApiResponse({ status: 200, description: 'Phone number status' })
  async checkPhoneExists(@CurrentUser() user: JwtUserPayload, @Body('ph_no') phone: string): Promise<{ exists: boolean }> {
    const exists = await this.userService.checkPhoneExists(phone);
    return { exists };
  }
}