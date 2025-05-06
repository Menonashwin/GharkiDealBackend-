// src/booking/booking.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
    Param, 
    Query, 
    BadRequestException, 
    NotFoundException 
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { BookingService } from './booking.service';
  import { CreateBookingDto } from './dto/create-booking.dto';
  import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
  import { BookingResponseDto } from './dto/booking-response.dto';
  import { CurrentUser, IsUser } from '../auth/decorators/current-user.decorator';
  import { JwtUserPayload } from '../auth/interfaces/user.interface';
  import { BookingStatus } from './models/booking.model';
  
  @ApiBearerAuth('access-token')
  @ApiTags('bookings')
  @Controller('bookings')
  export class BookingController {
    constructor(private readonly bookingService: BookingService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new booking' })
    @ApiResponse({ status: 201, description: 'Booking created', type: BookingResponseDto })
    async createBooking(
      @CurrentUser() user: JwtUserPayload,
      @IsUser() isUser: boolean,
      @Body() createBookingDto: CreateBookingDto
    ): Promise<any> {
      if (!isUser) {
        throw new BadRequestException('This endpoint is only for regular users');
      }
      
      try {
        const booking = await this.bookingService.createBooking(user.sub, createBookingDto);
        const bookingDetails = await this.bookingService.getBookingById(user.sub, booking.id);
        return bookingDetails;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException(`Failed to create booking: ${error.message}`);
      }
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all bookings with optional status filter' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [BookingResponseDto] })
    @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    async getUserBookings(
      @CurrentUser() user: JwtUserPayload,
      @IsUser() isUser: boolean,
      @Query('status') status?: BookingStatus,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
    ): Promise<any> {
      if (!isUser) {
        throw new BadRequestException('This endpoint is only for regular users');
      }
      
      try {
        return await this.bookingService.getUserBookings(user.sub, status, page, limit);
      } catch (error) {
        throw new BadRequestException(`Failed to get bookings: ${error.message}`);
      }
    }
  
    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming bookings' })
    @ApiResponse({ status: 200, description: 'List of upcoming bookings', type: [BookingResponseDto] })
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    async getUpcomingBookings(
      @CurrentUser() user: JwtUserPayload,
      @IsUser() isUser: boolean,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
    ): Promise<any> {
      if (!isUser) {
        throw new BadRequestException('This endpoint is only for regular users');
      }
      
      try {
        return await this.bookingService.getUpcomingBookings(user.sub, page, limit);
      } catch (error) {
        throw new BadRequestException(`Failed to get upcoming bookings: ${error.message}`);
      }
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get booking details' })
    @ApiResponse({ status: 200, description: 'Booking details', type: BookingResponseDto })
    async getBookingDetails(
      @CurrentUser() user: JwtUserPayload,
      @IsUser() isUser: boolean,
      @Param('id') bookingId: string
    ): Promise<any> {
      if (!isUser) {
        throw new BadRequestException('This endpoint is only for regular users');
      }
      
      try {
        return await this.bookingService.getBookingById(user.sub, bookingId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException(`Failed to get booking details: ${error.message}`);
      }
    }
  
    @Put(':id/status')
    @ApiOperation({ summary: 'Update booking status (cancel or complete)' })
    @ApiResponse({ status: 200, description: 'Booking status updated', type: BookingResponseDto })
    async updateBookingStatus(
      @CurrentUser() user: JwtUserPayload,
      @IsUser() isUser: boolean,
      @Param('id') bookingId: string,
      @Body() updateStatusDto: UpdateBookingStatusDto
    ): Promise<any> {
      if (!isUser) {
        throw new BadRequestException('This endpoint is only for regular users');
      }
      
      try {
        await this.bookingService.updateBookingStatus(user.sub, bookingId, updateStatusDto);
        return this.bookingService.getBookingById(user.sub, bookingId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException(`Failed to update booking status: ${error.message}`);
      }
    }
  }