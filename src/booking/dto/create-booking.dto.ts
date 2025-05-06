// src/booking/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Service provider ID',
    example: 'a9c77ed0-6af3-4fa9-b587-bd1d84e09215'
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Service provider ID is required' })
  service_provider_id: string;

  @ApiProperty({
    description: 'User address ID',
    example: 'b9c77ed0-6af3-4fa9-b587-bd1d84e09216'
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Address ID is required' })
  address_id: string;

  @ApiProperty({
    description: 'Type of service required',
    example: 'Plumbing'
  })
  @IsString()
  @IsNotEmpty({ message: 'Service type is required' })
  service_type: string;

  @ApiProperty({
    description: 'Booking date (YYYY-MM-DD)',
    example: '2025-05-15'
  })
  @IsDateString()
  @IsNotEmpty({ message: 'Booking date is required' })
  booking_date: string;

  @ApiProperty({
    description: 'Booking time (HH:MM:SS)',
    example: '14:00:00'
  })
  @IsString()
  @IsNotEmpty({ message: 'Booking time is required' })
  booking_time: string;

  @ApiProperty({
    description: 'Additional notes for the service provider (optional)',
    example: 'The leaky tap is in the master bathroom',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}