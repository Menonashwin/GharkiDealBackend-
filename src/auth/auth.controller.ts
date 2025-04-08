// src/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Res, 
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PhoneAuthDto, VerifyOtpDto, UserResponseDto, ServiceProviderResponseDto, UserType } from './dto/phone-auth.dto';
import { Public } from './decorators/public.decorator';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start phone authentication process' })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP sent to phone', 
    headers: {
      'Authorization': {
        description: 'Bearer token for authentication',
        schema: { type: 'string' }
      }
    }
  })
  async phoneAuth(@Body() phoneAuthDto: PhoneAuthDto, @Res() res: Response) {
    try {
      const entity = await this.authService.authenticatePhone(phoneAuthDto);
      
      // Set access token in header
      res.setHeader('Authorization', `Bearer ${entity.access_token}`);
      
      // Return entity details with OTP and user_type
      return res.json({
        id: entity.id,
        ph_no: entity.ph_no,
        user_type: phoneAuthDto.user_type || UserType.USER,
        is_profile_complete: entity.is_profile_complete,
        otp: entity.otp, // In production, don't return OTP in response
        message: 'OTP has been generated successfully'
      });
    } catch (error) {
      console.error('Phone authentication error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to process phone authentication',
        error: error.message
      });
    }
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP verified successfully',
    type: UserResponseDto
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    try {
      const entity = await this.authService.verifyOtp(verifyOtpDto);
      
      // Set access token in header
      res.setHeader('Authorization', `Bearer ${entity.access_token}`);
      
      // Remove sensitive data before returning
      const { otp: _, access_token: __, ...result } = entity.get({ plain: true });
      
      // Add user_type to the response
      const response = {
        ...result,
        user_type: verifyOtpDto.user_type || UserType.USER,
        message: 'OTP verified successfully'
      };
      
      return res.json(response);
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: error.message
        });
      }
      
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to verify OTP',
        error: error.message
      });
    }
  }
}