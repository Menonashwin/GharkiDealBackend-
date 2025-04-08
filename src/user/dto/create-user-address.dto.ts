// src/user/dto/create-user-address.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'Full address',
    example: '123 Main St, Apt 4B'
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Zone or area',
    example: 'Downtown'
  })
  @IsString()
  @IsNotEmpty({ message: 'Zone is required' })
  zone: string;

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
    default: false
  })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

