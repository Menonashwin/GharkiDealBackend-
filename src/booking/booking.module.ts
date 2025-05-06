// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './models/booking.model';
import { User } from '../user/models/user.model';
import { ServiceProvider } from '../service-provider/models/service-provider.model';
import { ServiceProviderProfile } from '../service-provider/models/service-provider-profile.model';
import { UserAddress } from '../user/models/user-address.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Booking, 
      User, 
      ServiceProvider, 
      ServiceProviderProfile, 
      UserAddress
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}