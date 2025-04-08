import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/models/user.model';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { ServiceProvider } from 'src/service-provider/models/service-provider.model';

@Module({
  imports: [SequelizeModule.forFeature([User, ServiceProvider])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Remove JwtModule from exports too
})
export class AuthModule {}
