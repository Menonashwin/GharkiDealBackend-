// src/user/dto/update-user-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserProfileDto {
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
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Zone or area',
    example: 'Downtown',
    required: false
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/uploads/profile-12345.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  profile_image_url?: string;
}