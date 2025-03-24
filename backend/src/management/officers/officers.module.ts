import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officers.controller';
import { OfficersService } from './service/officers.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { OfficersDomainModule } from './officer-domain/officers-domain.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: OfficersModule,
      },
    ]),
    ChurchesDomainModule,
    OfficersDomainModule,
  ],
  controllers: [OfficersController],
  providers: [OfficersService],
  exports: [],
})
export class OfficersModule {}
