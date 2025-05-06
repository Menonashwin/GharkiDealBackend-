// src/booking/dto/booking-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../models/booking.model';

export class BookingResponseDto {
  @ApiProperty({
    description: 'Booking ID',
    example: 'c9c77ed0-6af3-4fa9-b587-bd1d84e09217'
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'd9c77ed0-6af3-4fa9-b587-bd1d84e09218'
  })
  user_id: string;

  @ApiProperty({
    description: 'Service provider ID',
    example: 'a9c77ed0-6af3-4fa9-b587-bd1d84e09215'
  })
  service_provider_id: string;

  @ApiProperty({
    description: 'Service provider name',
    example: 'John Smith'
  })
  provider_name: string;

  @ApiProperty({
    description: 'Address ID',
    example: 'b9c77ed0-6af3-4fa9-b587-bd1d84e09216'
  })
  address_id: string;

  @ApiProperty({
    description: 'Full address',
    example: '123 Main St, Apt 4B, Downtown'
  })
  address: string;

  @ApiProperty({
    description: 'Service type',
    example: 'Plumbing'
  })
  service_type: string;

  @ApiProperty({
    description: 'Booking date',
    example: '2025-05-15'
  })
  booking_date: string;

  @ApiProperty({
    description: 'Booking time',
    example: '14:00:00'
  })
  booking_time: string;

  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.SCHEDULED
  })
  status: BookingStatus;

  @ApiProperty({
    description: 'Cancellation reason (if cancelled)',
    example: 'Schedule conflict',
    required: false
  })
  cancellation_reason?: string;

  @ApiProperty({
    description: 'Booking creation date',
    example: '2025-05-01T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Booking last update date',
    example: '2025-05-01T10:30:00Z'
  })
  updatedAt: Date;
}