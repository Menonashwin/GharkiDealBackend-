// src/user/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Profile completion status',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  is_profile_complete?: boolean;
}