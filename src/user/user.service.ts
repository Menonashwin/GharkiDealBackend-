import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserProfile } from './models/user-profile.model';
import { UserAddress } from './models/user-address.model';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserProfile)
    private userProfileModel: typeof UserProfile,
    @InjectModel(UserAddress)
    private userAddressModel: typeof UserAddress,
  ) {}

  /**
   * Find user by ID with profile and addresses
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id, {
      include: [
        { model: UserProfile },
        { model: UserAddress }
      ]
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * Find user by phone number
   */
  async findByPhone(ph_no: string): Promise<User | null> {
    return this.userModel.findOne({ 
      where: { ph_no },
      include: [
        { model: UserProfile },
        { model: UserAddress }
      ]
    });
  }

  /**
   * Check if a phone number exists in the database
   */
  async checkPhoneExists(ph_no: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { ph_no } });
    return !!user;
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateProfile(userId: string, profileData: CreateUserProfileDto): Promise<UserProfile> {
    // First check if user exists
    const user = await this.userModel.findByPk(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if email is already in use by another user
    if (profileData.email) {
      const existingProfile = await this.userProfileModel.findOne({ 
        where: { 
          email: profileData.email,
          user_id: { [Op.ne]: userId }
        } 
      });
      
      if (existingProfile) {
        throw new BadRequestException('Email is already in use by another account');
      }
    }

    // Find existing profile or create new one
    let profile = await this.userProfileModel.findOne({
      where: { user_id: userId }
    });

    if (profile) {
      // Update existing profile
      await profile.update(profileData);
    } else {
      // Create new profile
      profile = await this.userProfileModel.create({
        ...profileData,
        user_id: userId
      });
      
      // Mark user as profile complete
      await user.update({ is_profile_complete: true });
      
      // If zone is provided in profile data, update user zone too
      if (profileData.zone) {
        await user.update({ zone: profileData.zone });
      }
    }

    return profile;
  }

  /**
   * Update user profile image
   */
  async updateProfileImage(userId: string, imageUrl: string): Promise<UserProfile> {
    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Find existing profile or create a minimal one
    let profile = await this.userProfileModel.findOne({
      where: { user_id: userId }
    });

    if (profile) {
      // Update existing profile with image URL
      await profile.update({ profile_image_url: imageUrl });
    } else {
      // Cannot upload image without a profile
      throw new BadRequestException('Please create a profile first before uploading an image');
    }

    return profile;
  }

  /**
   * Add a new address for a user
   */
  async addAddress(userId: string, addressData: CreateUserAddressDto): Promise<UserAddress> {
    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If this is the first address or is_default is true, handle default flag
    if (addressData.is_default) {
      // Reset default flag on all existing addresses
      await this.userAddressModel.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    } else {
      // Check if this is the first address
      const addressCount = await this.userAddressModel.count({
        where: { user_id: userId }
      });
      
      // If it's the first address, make it default
      if (addressCount === 0) {
        addressData.is_default = true;
      }
    }

    // Create the new address
    const address = await this.userAddressModel.create({
      ...addressData,
      user_id: userId
    });

    // If this is a new address and zone is not set on user, update user's zone
    if (!user.zone && addressData.zone) {
      await user.update({ zone: addressData.zone });
    }

    return address;
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.userAddressModel.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  /**
   * Update an address
   */
  async updateAddress(userId: string, addressId: string, updateData: UpdateUserAddressDto): Promise<UserAddress> {
    // Find the address
    const address = await this.userAddressModel.findOne({
      where: {
        id: addressId,
        user_id: userId
      }
    });
    
    if (!address) {
      throw new NotFoundException(`Address not found or does not belong to user`);
    }

    // If setting as default, update other addresses
    if (updateData.is_default) {
      await this.userAddressModel.update(
        { is_default: false },
        { where: { user_id: userId, id: { [Op.ne]: addressId } } }
      );
    }

    // Update the address
    await address.update(updateData);
    
    // If zone is updated and it's a default address, update user's zone too
    if (updateData.zone && address.is_default) {
      await this.userModel.update(
        { zone: updateData.zone },
        { where: { id: userId } }
      );
    }
    
    return address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    const address = await this.userAddressModel.findOne({
      where: {
        id: addressId,
        user_id: userId
      }
    });
    
    if (!address) {
      throw new NotFoundException(`Address not found or does not belong to user`);
    }
    
    const wasDefault = address.is_default;
    
    // Delete the address
    await address.destroy();
    
    // If it was the default address, set a new default
    if (wasDefault) {
      const addresses = await this.userAddressModel.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 1
      });
      
      if (addresses.length > 0) {
        await addresses[0].update({ is_default: true });
        
        // Update user's zone to match the new default address
        await this.userModel.update(
          { zone: addresses[0].zone },
          { where: { id: userId } }
        );
      }
    }
    
    return true;
  }

  /**
   * Update user's access token
   */
  async updateAccessToken(id: string, token: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await user.update({ access_token: token });
    return user;
  }
}