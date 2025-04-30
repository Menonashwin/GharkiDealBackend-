import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UploadedFile,
  Req,
  NotFoundException, 
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserResponseDto } from '../auth/dto/phone-auth.dto';
import { CurrentUser, IsUser } from '../auth/decorators/current-user.decorator';
import { JwtUserPayload } from '../auth/interfaces/user.interface';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserAddressResponseDto } from './dto/user-address-response.dto';
import { UserProfile } from './models/user-profile.model';
import { UserAddress } from './models/user-address.model';
import { GlobalUploadService } from '../common/upload/global-upload.service';
import { SingleFileUpload } from '../common/upload/file-upload.decorators';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@ApiBearerAuth('access-token')
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly globalUploadService: GlobalUploadService
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile with addresses' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getProfile(@CurrentUser() user: JwtUserPayload, @IsUser() isUser: boolean): Promise<any> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    const userWithDetails = await this.userService.findById(user.sub);
    
    if (!userWithDetails) {
      throw new NotFoundException('User not found');
    }
    
    // Format response
    const plainUser = userWithDetails.get({ plain: true });
    
    // Remove sensitive fields
    const { access_token, otp, ...result } = plainUser;
    
    return result;
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create or update user profile' })
  @ApiResponse({ status: 200, description: 'Profile created/updated', type: UserProfileResponseDto })
  async createOrUpdateProfile(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean,
    @Body() profileData: CreateUserProfileDto
  ): Promise<UserProfile> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    try {
      const profile = await this.userService.createOrUpdateProfile(user.sub, profileData);
      return profile;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Email is already in use');
      }
      throw new BadRequestException(`Failed to update profile: ${error.message}`);
    }
  }


  // Add this method to your UserController class

@Put('profile')
@ApiOperation({ summary: 'Update existing user profile' })
@ApiResponse({ status: 200, description: 'Profile updated', type: UserProfileResponseDto })
async updateProfile(
  @CurrentUser() user: JwtUserPayload,
  @IsUser() isUser: boolean,
  @Body() profileData: UpdateUserProfileDto
): Promise<UserProfile> {
  if (!isUser) {
    throw new BadRequestException('This endpoint is only for regular users');
  }
  
  try {
    // First check if profile exists
    const existingProfile = await this.userService.getUserProfile(user.sub);
    
    if (!existingProfile) {
      throw new BadRequestException('Profile not found. Please create a profile first');
    }
    
    // Update the profile
    const profile = await this.userService.updateUserProfile(user.sub, profileData);
    return profile;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ConflictException('Email is already in use');
    }
    throw new BadRequestException(`Failed to update profile: ${error.message}`);
  }
}

  @Post('profile-image')
  @ApiOperation({ summary: 'Upload profile image' })
  @SingleFileUpload('file')
  async uploadProfileImage(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ): Promise<{ url: string }> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    try {
      // Process the file using the global upload service
      const fileUrl = this.globalUploadService.processFile(file, req);
      
      // Update the user's profile with the image URL
      await this.userService.updateProfileImage(user.sub, fileUrl);
      
      return { url: fileUrl };
    } catch (error) {
      throw new BadRequestException(`Failed to upload profile image: ${error.message}`);
    }
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new address' })
  @ApiResponse({ status: 201, description: 'Address added', type: UserAddressResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean,
    @Body() addressData: CreateUserAddressDto
  ): Promise<UserAddress> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    try {
      return await this.userService.addAddress(user.sub, addressData);
    } catch (error) {
      throw new BadRequestException(`Failed to add address: ${error.message}`);
    }
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses', type: [UserAddressResponseDto] })
  async getUserAddresses(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean
  ): Promise<UserAddress[]> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    return this.userService.getUserAddresses(user.sub);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated', type: UserAddressResponseDto })
  async updateAddress(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean,
    @Param('id') addressId: string,
    @Body() updateData: UpdateUserAddressDto
  ): Promise<UserAddress> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    try {
      return await this.userService.updateAddress(user.sub, addressId, updateData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update address: ${error.message}`);
    }
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async deleteAddress(
    @CurrentUser() user: JwtUserPayload,
    @IsUser() isUser: boolean,
    @Param('id') addressId: string
  ): Promise<{ success: boolean }> {
    if (!isUser) {
      throw new BadRequestException('This endpoint is only for regular users');
    }
    
    try {
      const result = await this.userService.deleteAddress(user.sub, addressId);
      return { success: result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete address: ${error.message}`);
    }
  }
  
  @Get('phone/:phone')
  @ApiOperation({ summary: 'Check if phone number exists' })
  @ApiResponse({ status: 200, description: 'Phone number status' })
  async checkPhoneExists(@Body('ph_no') phone: string): Promise<{ exists: boolean }> {
    const exists = await this.userService.checkPhoneExists(phone);
    return { exists };
  }
}