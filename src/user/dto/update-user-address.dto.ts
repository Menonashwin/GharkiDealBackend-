// src/user/dto/update-user-address.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserAddressDto {
  @ApiProperty({
    description: 'Full address',
    example: '123 Main St, Apt 4B',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Zone or area',
    example: 'Downtown',
    required: false
  })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({
    description: 'Landmark for easier navigation',
    example: 'Near Central Park',
    required: false
  })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({
    description: 'Set as default address',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

