// src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { PhoneAuthDto, UserRole } from './dto/phone-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a random 5-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  /**
   * Handle phone authentication - both for new and existing users
   */
  async authenticatePhone(phoneAuthDto: PhoneAuthDto): Promise<User> {
    const { ph_no, role = UserRole.USER } = phoneAuthDto;

    // Check if user exists
    let user = await this.userModel.findOne({
      where: { ph_no },
    });

    // Generate OTP
    const otp = this.generateOtp();
    
    if (user) {
      // User exists
      // If role is provided and different from existing role, update it
      if (role && role !== user.role) {
        await user.update({ role });
      }
      
      // Generate JWT with user ID and role
      const payload = { 
        ph_no, 
        sub: user.id,
        role: user.role
      };
      const accessToken = this.jwtService.sign(payload);
      
      // Update user with new OTP and token
      await user.update({ 
        otp, 
        access_token: accessToken 
      });
    } else {
      // New user - create with phone, role, OTP
      user = await this.userModel.create({
        ph_no,
        role,
        otp,
      });
      
      // Generate JWT with new user ID and role
      const payload = { 
        ph_no, 
        sub: user.id,
        role: user.role
      };
      const accessToken = this.jwtService.sign(payload);
      
      // Update user with token
      await user.update({ access_token: accessToken });
    }
    
    // In a real app, you'd send the OTP via SMS here
    
    return user;
  }

  /**
   * Verify OTP for a phone number
   */
  async verifyOtp(ph_no: string, otpToVerify: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { ph_no },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.otp !== otpToVerify) {
      throw new BadRequestException('Invalid OTP');
    }

    // Generate a fresh token with user info including role
    const payload = { 
      ph_no: user.ph_no, 
      sub: user.id,
      role: user.role
    };
    const accessToken = this.jwtService.sign(payload);
    
    // Clear OTP and update token after successful verification
    await user.update({ 
      otp: null,
      access_token: accessToken
    });

    return user;
  }
}