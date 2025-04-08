// src/auth/auth.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { PhoneAuthDto, VerifyOtpDto, UserType } from './dto/phone-auth.dto';
import { User } from 'src/user/models/user.model';
import { ServiceProvider } from 'src/service-provider/models/service-provider.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(ServiceProvider)
    private readonly serviceProviderModel: typeof ServiceProvider,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a random 5-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  /**
   * Handle phone authentication - both for new and existing users/service providers
   */
  async authenticatePhone(phoneAuthDto: PhoneAuthDto): Promise<User | ServiceProvider> {
    const { ph_no, user_type = UserType.USER } = phoneAuthDto;

    // Generate OTP
    const otp = this.generateOtp();
    
    // Handle user authentication
    if (user_type === UserType.USER) {
      return this.authenticateUser(ph_no, otp, user_type);
    } 
    // Handle service provider authentication
    else {
      return this.authenticateServiceProvider(ph_no, otp, user_type);
    }
  }

  /**
   * Handle user authentication
   */
  private async authenticateUser(ph_no: string, otp: string, user_type: UserType): Promise<User> {
    // Check if user exists
    let user = await this.userModel.findOne({ where: { ph_no } });
    
    if (user) {
      // User exists - update with new OTP
      const payload = { ph_no, sub: user.id, user_type };
      const accessToken = this.jwtService.sign(payload);
      
      await user.update({ otp, access_token: accessToken });
    } else {
      // New user - create with phone, OTP
      user = await this.userModel.create({ ph_no, otp });
      
      // Generate JWT with new user ID and type
      const payload = { ph_no, sub: user.id, user_type };
      const accessToken = this.jwtService.sign(payload);
      
      await user.update({ access_token: accessToken });
    }
    
    return user;
  }

  /**
   * Handle service provider authentication
   */
  private async authenticateServiceProvider(ph_no: string, otp: string, user_type: UserType): Promise<ServiceProvider> {
    // Check if service provider exists
    let serviceProvider = await this.serviceProviderModel.findOne({ where: { ph_no } });
    
    if (serviceProvider) {
      // Service provider exists - update with new OTP
      const payload = { ph_no, sub: serviceProvider.id, user_type };
      const accessToken = this.jwtService.sign(payload);
      
      await serviceProvider.update({ otp, access_token: accessToken });
    } else {
      // New service provider - create with phone, OTP
      serviceProvider = await this.serviceProviderModel.create({ ph_no, otp });
      
      // Generate JWT with new service provider ID and type
      const payload = { ph_no, sub: serviceProvider.id, user_type };
      const accessToken = this.jwtService.sign(payload);
      
      await serviceProvider.update({ access_token: accessToken });
    }
    
    return serviceProvider;
  }

  /**
   * Verify OTP for a phone number
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<User | ServiceProvider> {
    const { ph_no, otp: otpToVerify, user_type = UserType.USER } = verifyOtpDto;
    
    // Verify based on user type
    if (user_type === UserType.USER) {
      return this.verifyUserOtp(ph_no, otpToVerify, user_type);
    } else {
      return this.verifyServiceProviderOtp(ph_no, otpToVerify, user_type);
    }
  }

  /**
   * Verify OTP for a user
   */
  private async verifyUserOtp(ph_no: string, otpToVerify: string, user_type: UserType): Promise<User> {
    const user = await this.userModel.findOne({ where: { ph_no } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.otp !== otpToVerify) {
      throw new BadRequestException('Invalid OTP');
    }

    // Generate a fresh token with user info
    const payload = { ph_no: user.ph_no, sub: user.id, user_type };
    const accessToken = this.jwtService.sign(payload);
    
    // Clear OTP and update token after successful verification
    await user.update({ otp: null, access_token: accessToken });

    return user;
  }

  /**
   * Verify OTP for a service provider
   */
  private async verifyServiceProviderOtp(ph_no: string, otpToVerify: string, user_type: UserType): Promise<ServiceProvider> {
    const serviceProvider = await this.serviceProviderModel.findOne({ where: { ph_no } });

    if (!serviceProvider) {
      throw new NotFoundException('Service provider not found');
    }

    if (serviceProvider.otp !== otpToVerify) {
      throw new BadRequestException('Invalid OTP');
    }

    // Generate a fresh token with service provider info
    const payload = { ph_no: serviceProvider.ph_no, sub: serviceProvider.id, user_type };
    const accessToken = this.jwtService.sign(payload);
    
    // Clear OTP and update token after successful verification
    await serviceProvider.update({ otp: null, access_token: accessToken });

    return serviceProvider;
  }
}