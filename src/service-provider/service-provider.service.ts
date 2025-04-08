// src/service-provider/service-provider.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ServiceProvider } from './models/service-provider.model';
import { ServiceProviderProfile } from './models/service-provider-profile.model';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { Op } from 'sequelize';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectModel(ServiceProvider)
    private serviceProviderModel: typeof ServiceProvider,
    @InjectModel(ServiceProviderProfile)
    private serviceProviderProfileModel: typeof ServiceProviderProfile,
  ) {}

  /**
   * Find service provider by ID with profile
   */
  async findById(id: string): Promise<ServiceProvider | null> {
    const provider = await this.serviceProviderModel.findByPk(id, {
      include: [
        { model: ServiceProviderProfile }
      ]
    });
    
    if (!provider) {
      throw new NotFoundException(`Service provider with ID ${id} not found`);
    }
    
    return provider;
  }

  /**
   * Find service provider by phone number
   */
  async findByPhone(ph_no: string): Promise<ServiceProvider | null> {
    return this.serviceProviderModel.findOne({ 
      where: { ph_no },
      include: [
        { model: ServiceProviderProfile }
      ]
    });
  }

  // Add this method to your service-provider.service.ts

/**
 * Get all service providers with pagination and filtering
 */
async getAllServiceProviders(
    page: number = 1,
    limit: number = 10,
    serviceType?: string,
    zone?: string
  ): Promise<{ providers: ServiceProvider[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Build where conditions for profile
    const profileWhere: any = {};
    if (serviceType) {
      profileWhere.service_type = serviceType;
    }
    if (zone) {
      profileWhere.zone = zone;
    }
    
    // Query with filtering and pagination
    const { rows, count } = await this.serviceProviderModel.findAndCountAll({
      where: {
        is_profile_complete: true,
        is_verified: true, // Only show verified providers
      },
      include: [
        { 
          model: ServiceProviderProfile,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
        }
      ],
      limit,
      offset,
      order: [
        [{ model: ServiceProviderProfile, as: 'profile' }, 'rating', 'DESC']
      ],
      distinct: true, // Important for correct count with associations
    });
    
    return {
      providers: rows,
      total: count
    };
  }

  /**
   * Check if a phone number exists in the database
   */
  async checkPhoneExists(ph_no: string): Promise<boolean> {
    const provider = await this.serviceProviderModel.findOne({ where: { ph_no } });
    return !!provider;
  }

  /**
   * Create or update service provider profile
   */
  async createOrUpdateProfile(providerId: string, profileData: CreateProviderProfileDto | UpdateProviderProfileDto): Promise<ServiceProviderProfile> {
    // First check if service provider exists
    const provider = await this.serviceProviderModel.findByPk(providerId);
    
    if (!provider) {
      throw new NotFoundException(`Service provider with ID ${providerId} not found`);
    }

    // Check if email is already in use by another provider
    if (profileData.email) {
      const existingProfile = await this.serviceProviderProfileModel.findOne({ 
        where: { 
          email: profileData.email,
          service_provider_id: { [Op.ne]: providerId }
        } 
      });
      
      if (existingProfile) {
        throw new ConflictException('Email is already in use by another account');
      }
    }

    // Find existing profile or create new one
    let profile = await this.serviceProviderProfileModel.findOne({
      where: { service_provider_id: providerId }
    });

    if (profile) {
      // Update existing profile
      await profile.update(profileData);
    } else {
      // Create new profile 
      // Need to make sure we have all required fields for creation
      if (!this.validateRequiredFields(profileData as CreateProviderProfileDto)) {
        throw new BadRequestException('Missing required fields for profile creation');
      }
      
      profile = await this.serviceProviderProfileModel.create({
        ...profileData,
        service_provider_id: providerId,
        rating: 0 // Default rating for new profiles
      });
      
      // Mark provider as profile complete
      await provider.update({ is_profile_complete: true });
    }

    return profile;
  }

  /**
   * Validate required fields for profile creation
   */
  private validateRequiredFields(profileData: CreateProviderProfileDto): boolean {
    return !!(
      profileData.name && 
      profileData.address && 
      profileData.zone && 
      profileData.service_type
    );
  }

  /**
   * Update profile image URL
   */
  async updateProfileImage(providerId: string, imageUrl: string): Promise<ServiceProviderProfile> {
    const profile = await this.serviceProviderProfileModel.findOne({
      where: { service_provider_id: providerId }
    });
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first');
    }
    
    await profile.update({ profile_image_url: imageUrl });
    return profile;
  }

  /**
   * Update ID proof URL
   */
  async updateIdProof(providerId: string, idProofUrl: string): Promise<ServiceProviderProfile> {
    const profile = await this.serviceProviderProfileModel.findOne({
      where: { service_provider_id: providerId }
    });
    
    if (!profile) {
      throw new NotFoundException('Profile not found. Please create a profile first');
    }
    
    await profile.update({ id_proof_url: idProofUrl });
    return profile;
  }

  /**
   * Search service providers by criteria
   */
  async searchProviders(serviceType?: string, zone?: string, query?: string): Promise<ServiceProvider[]> {
    const whereClause: any = {};
    const profileWhereClause: any = {};
    
    // Add service type filter
    if (serviceType) {
      profileWhereClause.service_type = serviceType;
    }
    
    // Add zone filter
    if (zone) {
      profileWhereClause.zone = zone;
    }
    
    // Add name/bio search
    if (query) {
      profileWhereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { bio: { [Op.iLike]: `%${query}%` } }
      ];
    }
    
    // Only get providers with completed profiles
    whereClause.is_profile_complete = true;
    
    return this.serviceProviderModel.findAll({
      where: whereClause,
      include: [
        { 
          model: ServiceProviderProfile,
          where: Object.keys(profileWhereClause).length > 0 ? profileWhereClause : undefined
        }
      ],
      order: [
        [{ model: ServiceProviderProfile, as: 'profile' }, 'rating', 'DESC']
      ]
    });
  }

  /**
   * Update service provider's access token
   */
  async updateAccessToken(id: string, token: string): Promise<ServiceProvider> {
    const provider = await this.serviceProviderModel.findByPk(id);
    
    if (!provider) {
      throw new NotFoundException(`Service provider with ID ${id} not found`);
    }
    
    await provider.update({ access_token: token });
    return provider;
  }
}