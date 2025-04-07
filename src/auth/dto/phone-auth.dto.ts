// src/auth/dto/phone-auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  USER = 'user',
  SERVICE_PROVIDER = 'service_provider'
}

export class PhoneAuthDto {
  @ApiProperty({
    description: '10-digit phone number',
    example: '9876543210',
  })
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  ph_no: string;
  
  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: UserRole,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: '10-digit phone number',
    example: '9876543210',
  })
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  ph_no: string;

  @ApiProperty({
    description: '5-digit OTP',
    example: '12345',
  })
  @IsString()
  @Length(5, 5)
  @Matches(/^[0-9]+$/, { message: 'OTP must contain only digits' })
  otp: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ph_no: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER
  })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}