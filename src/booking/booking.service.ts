// src/booking/booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking, BookingStatus } from './models/booking.model';
import { User } from '../user/models/user.model';
import { ServiceProvider } from '../service-provider/models/service-provider.model';
import { ServiceProviderProfile } from '../service-provider/models/service-provider-profile.model';
import { UserAddress } from '../user/models/user-address.model';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Op } from 'sequelize';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking)
    private bookingModel: typeof Booking,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ServiceProvider)
    private serviceProviderModel: typeof ServiceProvider,
    @InjectModel(UserAddress)
    private userAddressModel: typeof UserAddress,
    @InjectModel(ServiceProviderProfile)
    private serviceProviderProfileModel: typeof ServiceProviderProfile,
  ) {}

  /**
   * Create a new booking
   */
  async createBooking(userId: string, bookingData: CreateBookingDto): Promise<Booking> {
    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if service provider exists and is verified
    const serviceProvider = await this.serviceProviderModel.findByPk(bookingData.service_provider_id, {
      include: [{ model: ServiceProviderProfile }]
    });
    
    if (!serviceProvider) {
      throw new NotFoundException('Service provider not found');
    }
    
    if (!serviceProvider.is_verified) {
      throw new BadRequestException('Service provider is not verified');
    }

    // Check if address belongs to user
    const address = await this.userAddressModel.findOne({
      where: {
        id: bookingData.address_id,
        user_id: userId
      }
    });
    
    if (!address) {
      throw new NotFoundException('Address not found or does not belong to user');
    }

    // Validate service type against provider's profile
    if (serviceProvider.profile && serviceProvider.profile.service_type !== bookingData.service_type) {
      throw new BadRequestException('Service type does not match provider\'s services');
    }

    // Create booking
    return this.bookingModel.create({
        user_id: userId,
        service_provider_id: bookingData.service_provider_id,
        address_id: bookingData.address_id,
        service_type: bookingData.service_type,
        booking_date: new Date(bookingData.booking_date), // Convert string to Date
        booking_time: bookingData.booking_time,
        status: BookingStatus.SCHEDULED
      });
  }

  /**
   * Get all bookings for a user with optional filters
   */
  async getUserBookings(
    userId: string, 
    status?: BookingStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ bookings: any[], total: number, page: number, limit: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions: any = { user_id: userId };
    if (status) {
      whereConditions.status = status;
    }
    
    // Query with pagination
    const { rows, count } = await this.bookingModel.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: ServiceProvider,
          include: [{ model: ServiceProviderProfile }]
        },
        { model: UserAddress }
      ],
      limit,
      offset,
      order: [['booking_date', 'DESC'], ['booking_time', 'DESC']],
      distinct: true
    });
    
    // Format response data
    const formattedBookings = rows.map(booking => {
      const plainBooking = booking.get({ plain: true });
      return {
        id: plainBooking.id,
        user_id: plainBooking.user_id,
        service_provider_id: plainBooking.service_provider_id,
        provider_name: plainBooking.serviceProvider?.profile?.name,
        address_id: plainBooking.address_id,
        address: `${plainBooking.address?.address}, ${plainBooking.address?.zone}`,
        service_type: plainBooking.service_type,
        booking_date: plainBooking.booking_date,
        booking_time: plainBooking.booking_time,
        status: plainBooking.status,
        cancellation_reason: plainBooking.cancellation_reason,
        createdAt: plainBooking.createdAt,
        updatedAt: plainBooking.updatedAt
      };
    });
    
    return {
      bookings: formattedBookings,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Get upcoming bookings for a user
   */
  async getUpcomingBookings(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const whereConditions = {
      user_id: userId,
      status: BookingStatus.SCHEDULED,
      [Op.or]: [
        { booking_date: { [Op.gt]: today } },
        {
          booking_date: today,
          booking_time: { [Op.gte]: today.toTimeString().split(' ')[0] }
        }
      ]
    };
    
    return this.getBookingsWithCondition(whereConditions, page, limit);
  }

  /**
   * Get booking details by ID
   */
  async getBookingById(userId: string, bookingId: string): Promise<any> {
    const booking = await this.bookingModel.findOne({
      where: {
        id: bookingId,
        user_id: userId
      },
      include: [
        { 
          model: ServiceProvider,
          include: [{ model: ServiceProviderProfile }]
        },
        { model: UserAddress }
      ]
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    const plainBooking = booking.get({ plain: true });
    
    return {
      id: plainBooking.id,
      user_id: plainBooking.user_id,
      service_provider_id: plainBooking.service_provider_id,
      provider_name: plainBooking.serviceProvider?.profile?.name,
      address_id: plainBooking.address_id,
      address: `${plainBooking.address?.address}, ${plainBooking.address?.zone}`,
      service_type: plainBooking.service_type,
      booking_date: plainBooking.booking_date,
      booking_time: plainBooking.booking_time,
      status: plainBooking.status,
      cancellation_reason: plainBooking.cancellation_reason,
      createdAt: plainBooking.createdAt,
      updatedAt: plainBooking.updatedAt
    };
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(userId: string, bookingId: string, updateData: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookingModel.findOne({
      where: {
        id: bookingId,
        user_id: userId
      }
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    // Check if status transition is valid
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled booking');
    }
    
    if (booking.status === BookingStatus.COMPLETED && updateData.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of a completed booking');
    }
    
    // If cancelling, require a reason
    if (updateData.status === BookingStatus.CANCELLED && !updateData.cancellation_reason) {
      throw new BadRequestException('Cancellation reason is required');
    }
    
    // Update booking status
    await booking.update({
      status: updateData.status,
      cancellation_reason: updateData.status === BookingStatus.CANCELLED ? updateData.cancellation_reason : null
    });
    
    return booking;
  }

  /**
   * Helper method to get bookings with condition
   */
  private async getBookingsWithCondition(whereConditions: any, page: number, limit: number): Promise<any> {
    const offset = (page - 1) * limit;
    
    const { rows, count } = await this.bookingModel.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: ServiceProvider,
          include: [{ model: ServiceProviderProfile }]
        },
        { model: UserAddress }
      ],
      limit,
      offset,
      order: [['booking_date', 'ASC'], ['booking_time', 'ASC']],
      distinct: true
    });
    
    // Format response data
    const formattedBookings = rows.map(booking => {
      const plainBooking = booking.get({ plain: true });
      return {
        id: plainBooking.id,
        user_id: plainBooking.user_id,
        service_provider_id: plainBooking.service_provider_id,
        provider_name: plainBooking.serviceProvider?.profile?.name,
        address_id: plainBooking.address_id,
        address: `${plainBooking.address?.address}, ${plainBooking.address?.zone}`,
        service_type: plainBooking.service_type,
        booking_date: plainBooking.booking_date,
        booking_time: plainBooking.booking_time,
        status: plainBooking.status,
        cancellation_reason: plainBooking.cancellation_reason,
        createdAt: plainBooking.createdAt,
        updatedAt: plainBooking.updatedAt
      };
    });
    
    return {
      bookings: formattedBookings,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
}