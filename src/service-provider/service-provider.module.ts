// src/service-provider/service-provider.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceProviderController } from './service-provider.controller';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProvider } from './models/service-provider.model';
import { ServiceProviderProfile } from './models/service-provider-profile.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ServiceProvider, ServiceProviderProfile]),
  ],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
  exports: [ServiceProviderService],
})
export class ServiceProviderModule {}