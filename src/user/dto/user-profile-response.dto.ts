// src/user/dto/user-profile-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: 'e0c77ed0-6af3-4fa9-b587-bd1d84e0923c'
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'a9c77ed0-6af3-4fa9-b587-bd1d84e09215'
  })
  user_id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com'
  })
  email: string;

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