// src/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Res, 
  BadRequestException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PhoneAuthDto, VerifyOtpDto, UserResponseDto } from './dto/phone-auth.dto';
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
      const user = await this.authService.authenticatePhone(phoneAuthDto);
      
      // Set access token in header
      res.setHeader('Authorization', `Bearer ${user.access_token}`);
      
      // Return user details with OTP and role
      return res.json({
        id: user.id,
        ph_no: user.ph_no,
        role: user.role,
        otp: user.otp, // In production, don't return OTP in response
        message: 'OTP has been generated successfully'
      });
    } catch (error) {
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
      const { ph_no, otp } = verifyOtpDto;
      console.log('the data ------------------>', ph_no, otp);
      const user = await this.authService.verifyOtp(ph_no, otp);
      
      // Set access token in header
      res.setHeader('Authorization', `Bearer ${user.access_token}`);
      
      // Remove sensitive data before returning
      const { otp: _, access_token: __, ...result } = user.get({ plain: true });
      
      return res.json({
        ...result,
        message: 'OTP verified successfully'
      });
    } catch (error) {
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