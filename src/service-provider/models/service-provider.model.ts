// src/service-provider/models/service-provider.model.ts
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, HasOne } from 'sequelize-typescript';
import { ServiceProviderProfile } from './service-provider-profile.model';

@Table({ tableName: 'service_providers', paranoid: true })
export class ServiceProvider extends Model<ServiceProvider> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(10),
    unique: true,
  })
  ph_no: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  access_token: string;

  @AllowNull(true)
  @Column(DataType.STRING(5))
  otp: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_profile_complete: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_verified: boolean;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @Column(DataType.DATE)
  deletedAt: Date;

  // Relationship with profile
  @HasOne(() => ServiceProviderProfile)
  profile: ServiceProviderProfile;
}