// src/booking/models/booking.model.ts
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ServiceProvider } from '../../service-provider/models/service-provider.model';
import { UserAddress } from '../../user/models/user-address.model';

export enum BookingStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Table({ tableName: 'bookings', paranoid: true })
export class Booking extends Model<Booking> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id: string;

  @ForeignKey(() => ServiceProvider)
  @AllowNull(false)
  @Column(DataType.UUID)
  service_provider_id: string;

  @ForeignKey(() => UserAddress)
  @AllowNull(false)
  @Column(DataType.UUID)
  address_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  service_type: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  booking_date: Date;

  @AllowNull(false)
  @Column(DataType.TIME)
  booking_time: string;

  @AllowNull(false)
  @Default(BookingStatus.SCHEDULED)
  @Column(DataType.ENUM(...Object.values(BookingStatus)))
  status: BookingStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  cancellation_reason: string;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @Column(DataType.DATE)
  deletedAt: Date;

  // Relationships
  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => ServiceProvider)
  serviceProvider: ServiceProvider;

  @BelongsTo(() => UserAddress)
  address: UserAddress;
}