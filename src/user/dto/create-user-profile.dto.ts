// src/user/dto/create-user-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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