// src/user/dto/user-address-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserAddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  zone: string;

  @ApiProperty()
  landmark: string;

  @ApiProperty()
  is_default: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

