// src/service-provider/service-provider.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
    Query, 
    UploadedFile,
    Req,
    BadRequestException,
    NotFoundException,
    ConflictException,
    Param
  } from '@nestjs/common';
  import { 
    ApiBearerAuth, 
    ApiOperation, 
    ApiResponse, 
    ApiTags
  } from '@nestjs/swagger';
  import { ServiceProviderService } from './service-provider.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { ProviderProfileResponseDto } from './dto/provider-profile-response.dto';
  import { CurrentUser, IsServiceProvider } from '../auth/decorators/current-user.decorator';
  import { JwtUserPayload } from '../auth/interfaces/user.interface';
  import { ServiceProvider } from './models/service-provider.model';
  import { ServiceProviderProfile } from './models/service-provider-profile.model';
  import { Request } from 'express';
  import { GlobalUploadService } from '../common/upload/global-upload.service';
  import { SingleFileUpload } from '../common/upload/file-upload.decorators';
import { Public } from 'src/auth/decorators/public.decorator';
  
  @ApiBearerAuth('access-token')
  @ApiTags('service-providers')
  @Controller('service-providers')
  export class ServiceProviderController {
    constructor(
      private readonly serviceProviderService: ServiceProviderService,
      private readonly globalUploadService: GlobalUploadService
    ) {}
  
    @Get('profile')
    @ApiOperation({ summary: 'Get current service provider profile' })
    @ApiResponse({ status: 200, description: 'Service provider profile', type: ProviderProfileResponseDto })
    async getProfile(@CurrentUser() user: JwtUserPayload, @IsServiceProvider() isProvider: boolean): Promise<any> {
      if (!isProvider) {
        throw new BadRequestException('This endpoint is only for service providers');
      }
      
      const providerWithDetails = await this.serviceProviderService.findById(user.sub);
      
      if (!providerWithDetails) {
        throw new NotFoundException('Service provider not found');
      }
      
      // Format response
      const plainProvider = providerWithDetails.get({ plain: true });
      
      // Remove sensitive fields from response
      const { access_token, otp, ...result } = plainProvider;
      
      return result;
    }

    // Add this endpoint to your service-provider.controller.ts

@Get()
@ApiOperation({ summary: 'Get all service providers' })
@ApiResponse({ status: 200, description: 'List of service providers' })
@Public() // Make this endpoint accessible without authentication
async getAllServiceProviders(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('service_type') serviceType?: string,
  @Query('zone') zone?: string
): Promise<any> {
  try {
    const providers = await this.serviceProviderService.getAllServiceProviders(
      page,
      limit,
      serviceType,
      zone
    );
    
    // Remove sensitive information
    const sanitizedProviders = providers.providers.map(provider => {
      const plainProvider = provider.get({ plain: true });
      const { access_token, otp, ...result } = plainProvider;
      return result;
    });
    
    return {
      providers: sanitizedProviders,
      total: providers.total,
      page,
      limit,
      totalPages: Math.ceil(providers.total / limit)
    };
  } catch (error) {
    throw new BadRequestException(`Failed to get service providers: ${error.message}`);
  }
}

// Add this endpoint to your service-provider.controller.ts

@Get(':id')
@ApiOperation({ summary: 'Get service provider details by ID' })
@ApiResponse({ status: 200, description: 'Service provider details' })
@ApiResponse({ status: 404, description: 'Service provider not found' })
@Public() // Make this endpoint accessible without authentication
async getServiceProviderById(@Param('id') id: string): Promise<any> {
  try {
    const provider = await this.serviceProviderService.findById(id);
    
    // Check if provider is verified and has a complete profile
    if (!provider.is_verified || !provider.is_profile_complete) {
      throw new NotFoundException('Service provider not found or not verified');
    }
    
    // Format response
    const plainProvider = provider.get({ plain: true });
    
    // Remove sensitive fields
    const { access_token, otp, ...result } = plainProvider;
    
    return result;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new BadRequestException(`Failed to get service provider: ${error.message}`);
  }
}
  
    @Post('profile')
    @ApiOperation({ summary: 'Create or update service provider profile' })
    @ApiResponse({ status: 200, description: 'Profile created/updated', type: ProviderProfileResponseDto })
    async createOrUpdateProfile(
      @CurrentUser() user: JwtUserPayload,
      @IsServiceProvider() isProvider: boolean,
      @Body() profileData: CreateProviderProfileDto
    ): Promise<ServiceProviderProfile> {
      if (!isProvider) {
        throw new BadRequestException('This endpoint is only for service providers');
      }
      
      try {
        const profile = await this.serviceProviderService.createOrUpdateProfile(user.sub, profileData);
        return profile;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new BadRequestException(`Failed to update profile: ${error.message}`);
      }
    }
  
    @Put('profile')
    @ApiOperation({ summary: 'Update service provider profile' })
    @ApiResponse({ status: 200, description: 'Profile updated', type: ProviderProfileResponseDto })
    async updateProfile(
      @CurrentUser() user: JwtUserPayload,
      @IsServiceProvider() isProvider: boolean,
      @Body() updateData: UpdateProviderProfileDto
    ): Promise<ServiceProviderProfile> {
      if (!isProvider) {
        throw new BadRequestException('This endpoint is only for service providers');
      }
      
      try {
        // Reuse the create/update method since it handles both scenarios
        const profile = await this.serviceProviderService.createOrUpdateProfile(user.sub, updateData);
        return profile;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new BadRequestException(`Failed to update profile: ${error.message}`);
      }
    }
  
    @Post('profile-image')
    @ApiOperation({ summary: 'Upload profile image' })
    @SingleFileUpload('file')
    async uploadProfileImage(
      @CurrentUser() user: JwtUserPayload,
      @IsServiceProvider() isProvider: boolean,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request
    ): Promise<{ url: string }> {
      if (!isProvider) {
        throw new BadRequestException('This endpoint is only for service providers');
      }
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      try {
        // Use the global upload service to process the file
        const fileUrl = this.globalUploadService.processFile(file, req);
        
        // Update profile with the new image URL
        await this.serviceProviderService.updateProfileImage(user.sub, fileUrl);
        
        return { url: fileUrl };
      } catch (error) {
        throw new BadRequestException(`Failed to upload profile image: ${error.message}`);
      }
    }
  
    @Post('id-proof')
    @ApiOperation({ summary: 'Upload ID proof document' })
    @SingleFileUpload('file')
    async uploadIdProof(
      @CurrentUser() user: JwtUserPayload,
      @IsServiceProvider() isProvider: boolean,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request
    ): Promise<{ url: string }> {
      if (!isProvider) {
        throw new BadRequestException('This endpoint is only for service providers');
      }
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      try {
        // Use the global upload service to process the file
        const fileUrl = this.globalUploadService.processFile(file, req);
        
        // Update profile with the new ID proof URL
        await this.serviceProviderService.updateIdProof(user.sub, fileUrl);
        
        return { url: fileUrl };
      } catch (error) {
        throw new BadRequestException(`Failed to upload ID proof: ${error.message}`);
      }
    }
  
    @Get('search')
    @ApiOperation({ summary: 'Search for service providers' })
    @ApiResponse({ status: 200, description: 'List of matching service providers' })
    async searchProviders(
      @Query('service_type') serviceType?: string,
      @Query('zone') zone?: string,
      @Query('query') query?: string
    ): Promise<any[]> {  // Changed return type to any[]
      try {
        const providers = await this.serviceProviderService.searchProviders(serviceType, zone, query);
        
        // Remove sensitive information and return plain objects
        return providers.map(provider => {
          const plainProvider = provider.get({ plain: true });
          const { access_token, otp, ...result } = plainProvider;
          return result;
        });
      } catch (error) {
        throw new BadRequestException(`Search failed: ${error.message}`);
      }
    }
  }