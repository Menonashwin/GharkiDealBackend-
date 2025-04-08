// src/service-provider/dto/provider-profile-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProviderProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: 'e0c77ed0-6af3-4fa9-b587-bd1d84e0923c'
  })
  id: string;

  @ApiProperty({
    description: 'Service provider ID',
    example: 'a9c77ed0-6af3-4fa9-b587-bd1d84e09215'
  })
  service_provider_id: string;

  @ApiProperty({
    description: 'Service provider name',
    example: 'John Smith'
  })
  name: string;

  @ApiProperty({
    description: 'Service provider email',
    example: 'john.smith@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Service provider address',
    example: '123 Main St, Apt 4B'
  })
  address: string;

  @ApiProperty({
    description: 'Zone or area of service',
    example: 'Downtown'
  })
  zone: string;

  @ApiProperty({
    description: 'Bio or description of services',
    example: 'Professional plumber with expertise in fixing leaky pipes and installing fixtures.'
  })
  bio: string;

  @ApiProperty({
    description: 'Provider rating (0-5)',
    example: 4.5
  })
  rating: number;

  @ApiProperty({
    description: 'Type of service provided',
    example: 'Plumber'
  })
  service_type: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5
  })
  experience_years: number;

  @ApiProperty({
    description: 'URL to ID proof document',
    example: 'https://example.com/uploads/idproof-12345.jpg'
  })
  id_proof_url: string;

  @ApiProperty({
    description: 'URL to profile image',
    example: 'https://example.com/uploads/profile-12345.jpg'
  })
  profile_image_url: string;

  @ApiProperty({
    description: 'Profile creation date',
    example: '2023-04-20T12:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Profile last update date',
    example: '2023-04-25T15:30:00Z'
  })
  updatedAt: Date;
}