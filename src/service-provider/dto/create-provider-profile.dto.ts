// src/service-provider/dto/create-provider-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateProviderProfileDto {
  @ApiProperty({
    description: 'Service provider name',
    example: 'John Smith'
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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
    example: '123 Main St, Apt 4B'
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Zone or area of service',
    example: 'Downtown'
  })
  @IsString()
  @IsNotEmpty({ message: 'Zone is required' })
  zone: string;

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
    example: 'Plumber'
  })
  @IsString()
  @IsNotEmpty({ message: 'Service type is required' })
  service_type: string;

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