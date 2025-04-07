import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { Op } from 'sequelize'; // Import Op directly from sequelize

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Find user by phone number
   */
  async findByPhone(ph_no: string): Promise<User | null> {
    return this.userModel.findOne({ where: { ph_no } });
  }

  /**
   * Check if a phone number exists in the database
   */
  async checkPhoneExists(ph_no: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { ph_no } });
    return !!user;
  }

  /**
   * Update user profile
   */
  // Updated updateUser method for UserService
  async updateUser(id: string, updateData: any): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and is already in use
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        throw new BadRequestException(
          'Email is already in use by another account',
        );
      }
    }

    try {
      // Update user with the provided data
      await user.update(updateData);

      // Fetch the updated user to ensure we return the latest data
      const updatedUser = await this.findById(id);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Update user's access token
   */
  async updateAccessToken(id: string, token: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.update({ access_token: token });
    return user;
  }

  /**
   * Complete user profile setup
   */
  async completeProfile(
    id: string,
    profileData: ProfileUpdateDto,
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is already in use by another user
    if (profileData.email) {
      const existingUser = await this.userModel.findOne({
        where: {
          email: profileData.email,
          id: { [Op.ne]: id }, // Not equal to current user - fixed Op import
        },
      });

      if (existingUser) {
        throw new BadRequestException(
          'Email is already in use by another account',
        );
      }
    }

    // Update profile data and mark as complete
    await user.update({
      ...profileData,
      is_profile_complete: true,
    });

    return user;
  }

  /**
   * Check if user's profile is complete
   */
  async isProfileComplete(id: string): Promise<boolean> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user.is_profile_complete;
  }
}
