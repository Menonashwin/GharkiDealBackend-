// src/auth/dto/phone-auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, IsEnum, IsOptional } from 'class-validator';

export enum UserType {
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
    description: 'User type',
    example: 'user',
    enum: UserType,
    default: UserType.USER
  })
  @IsEnum(UserType)
  @IsOptional()
  user_type?: UserType = UserType.USER;
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
  
  @ApiProperty({
    description: 'User type',
    example: 'user',
    enum: UserType,
    default: UserType.USER
  })
  @IsEnum(UserType)
  @IsOptional()
  user_type?: UserType = UserType.USER;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ph_no: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.USER
  })
  user_type: UserType;

  @ApiProperty()
  is_profile_complete: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServiceProviderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ph_no: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.SERVICE_PROVIDER
  })
  user_type: UserType;

  @ApiProperty()
  is_profile_complete: boolean;

  @ApiProperty()
  is_verified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}