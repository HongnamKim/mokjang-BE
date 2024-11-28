import { Module } from '@nestjs/common';
import { PositionsController } from './controller/positions.controller';
import { SettingsService } from './service/settings.service';
import { PositionsService } from './service/positions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionModel } from './entity/position.entity';
import { ChurchesModule } from '../churches.module';
import { RouterModule } from '@nestjs/core';
import { MinistriesController } from './controller/ministries.controller';
import { MinistryModel } from './entity/ministry.entity';
import { EducationsController } from './controller/educations.controller';
import { EducationModel } from './entity/education.entity';
import { GroupModel } from './entity/group.entity';
import { GroupsController } from './controller/groups.controller';
import { GroupsService } from './service/groups.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/settings', // 공통 prefix
        module: SettingsModule,
      },
    ]),
    ChurchesModule,
    TypeOrmModule.forFeature([
      PositionModel,
      MinistryModel,
      EducationModel,
      GroupModel,
    ]),
  ],
  controllers: [
    PositionsController,
    MinistriesController,
    EducationsController,
    GroupsController,
  ],
  providers: [SettingsService, PositionsService, GroupsService],
})
export class SettingsModule {}
