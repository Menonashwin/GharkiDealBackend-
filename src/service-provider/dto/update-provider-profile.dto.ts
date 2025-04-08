// src/service-provider/dto/update-provider-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateProviderProfileDto {
  @ApiProperty({
    description: 'Service provider name',
    example: 'John Smith',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Service provider email',
    example: 'john.smith@example.com',
    required: false
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Service provider address',
    example: '123 Main St, Apt 4B',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Zone or area of service',
    example: 'Downtown',
    required: false
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({
    description: 'Bio or description of services',
    example: 'Professional plumber with expertise in fixing leaky pipes and installing fixtures.',
    required: false
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Type of service provided',
    example: 'Plumber',
    required: false
  })
  @IsString()
  @IsOptional()
  service_type?: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
    required: false
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  experience_years?: number;
}