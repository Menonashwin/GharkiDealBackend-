// src/user/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, Apartment 4B',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'User zone/area',
    example: 'Downtown',
    required: false
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    required: false
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Profile completion status',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  is_profile_complete?: boolean;
}