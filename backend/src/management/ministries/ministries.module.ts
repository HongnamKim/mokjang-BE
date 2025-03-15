import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryModel } from './entity/ministry.entity';
import { MinistryGroupModel } from './entity/ministry-group.entity';
import { MinistriesController } from './controller/ministries.controller';
import { MinistryGroupsController } from './controller/ministry-groups.controller';
import { MinistryService } from './service/ministry.service';
import { MinistryGroupService } from './service/ministry-group.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';
import { MinistriesDomainModule } from './ministries-domain/ministries-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: MinistriesModule,
      },
    ]),
    TypeOrmModule.forFeature([MinistryModel, MinistryGroupModel]),
    ChurchesDomainModule,
    MinistriesDomainModule,
  ],
  controllers: [MinistriesController, MinistryGroupsController],
  providers: [MinistryService, MinistryGroupService],
  exports: [MinistryService, MinistryGroupService],
})
export class MinistriesModule {}
