// src/user/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User role',
    example: 'customer',
    required: false
  })
  @IsString()
  @IsOptional()
  role?: string;
  
  // You can add more fields here that users are allowed to update
  // For example: name, avatar, preferences, etc.
}