import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull } from 'sequelize-typescript';

@Table({ tableName: 'users', paranoid: true })
export class User extends Model<User> {
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
  @Column(DataType.STRING)
  role: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  access_token: string;

  @AllowNull(true)
  @Column(DataType.STRING(5))
  otp: string;

  // Profile fields
  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  address: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  zone: string;

  // Track if profile is complete
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_profile_complete: boolean;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  @Column(DataType.DATE)
  deletedAt: Date;
}