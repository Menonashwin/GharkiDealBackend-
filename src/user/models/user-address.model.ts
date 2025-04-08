// src/user/models/user-address.model.ts
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'user_addresses', paranoid: true })
export class UserAddress extends Model<UserAddress> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  address: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  zone: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  landmark: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default: boolean;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @Column(DataType.DATE)
  deletedAt: Date;

  // Relationship with user
  @BelongsTo(() => User)
  user: User;
}