// src/user/models/user-profile.model.ts
import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'user_profiles', paranoid: true })
export class UserProfile extends Model<UserProfile> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  profile_image_url: string;

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