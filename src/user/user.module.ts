// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { UserProfile } from './models/user-profile.model';
import { UserAddress } from './models/user-address.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserProfile, UserAddress]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}