import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officers.controller';
import { SettingsService } from './service/settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerModel } from './entity/officer.entity';
import { ChurchesModule } from '../churches.module';
import { RouterModule } from '@nestjs/core';
import { MinistriesController } from './controller/ministries.controller';
import { MinistryModel } from './entity/ministry.entity';
import { EducationsController } from './controller/educations.controller';
import { EducationModel } from './entity/education.entity';
import { GroupModel } from './entity/group.entity';
import { GroupsController } from './controller/groups.controller';
import { GroupsService } from './service/groups.service';
import { MembersModule } from '../members/members.module';
import { GroupRoleModel } from './entity/group-role.entity';
import { GroupsRolesController } from './controller/groups-roles.controller';
import { GroupsRolesService } from './service/groups-roles.service';
import { EducationsService } from './service/educations.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/settings', // 공통 prefix
        module: SettingsModule,
      },
    ]),
    ChurchesModule,
    MembersModule,
    TypeOrmModule.forFeature([
      OfficerModel,
      MinistryModel,
      EducationModel,
      GroupModel,
      GroupRoleModel,
    ]),
  ],
  controllers: [
    OfficersController,
    MinistriesController,
    EducationsController,
    GroupsController,
    GroupsRolesController,
  ],
  providers: [
    SettingsService,
    GroupsService,
    GroupsRolesService,
    EducationsService,
  ],
  exports: [
    SettingsService,
    GroupsService,
    EducationsService,
    GroupsRolesService,
  ],
})
export class SettingsModule {}
