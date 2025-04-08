// src/service-provider/models/service-provider-profile.model.ts
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ServiceProvider } from './service-provider.model';

@Table({ tableName: 'service_provider_profiles', paranoid: true })
export class ServiceProviderProfile extends Model<ServiceProviderProfile> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => ServiceProvider)
  @AllowNull(false)
  @Column(DataType.UUID)
  service_provider_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  address: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  zone: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  bio: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  rating: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  service_type: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  experience_years: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  id_proof_url: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  profile_image_url: string;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @Column(DataType.DATE)
  deletedAt: Date;

  // Relationship with service provider
  @BelongsTo(() => ServiceProvider)
  serviceProvider: ServiceProvider;
}