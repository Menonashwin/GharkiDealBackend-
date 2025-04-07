import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

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
  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await user.update(updateData);
    return user;
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
}