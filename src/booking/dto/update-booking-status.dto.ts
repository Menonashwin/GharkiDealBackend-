// src/booking/dto/update-booking-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../models/booking.model';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'New booking status',
    enum: BookingStatus,
    example: BookingStatus.COMPLETED
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty({ message: 'Status is required' })
  status: BookingStatus;

  @ApiProperty({
    description: 'Reason for cancellation (required if status is CANCELLED)',
    example: 'Service provider unavailable',
    required: false
  })
  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}