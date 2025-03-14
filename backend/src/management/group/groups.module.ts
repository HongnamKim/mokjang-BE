import { Module } from '@nestjs/common';
import { GroupDomainModule } from './group-management-domain/group-domain.module';
import { GroupsService } from './service/groups.service';
import { GroupRolesService } from './service/group-roles.service';
import { GroupsController } from './controller/groups.controller';
import { GroupsRolesController } from './controller/groups-roles.controller';
import { IGROUPS_DOMAIN_SERVICE } from './group-management-domain/interface/groups-domain.service.interface';
import { GroupsDomainService } from './group-management-domain/groups-domain.service';
import { IGROUP_ROLES_DOMAIN_SERVICE } from './group-management-domain/interface/groups-roles-domain.service.interface';
import { GroupRolesDomainService } from './group-management-domain/group-roles-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupModel } from './entity/group.entity';
import { GroupRoleModel } from './entity/group-role.entity';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: GroupsModule,
      },
    ]),
    TypeOrmModule.forFeature([GroupModel, GroupRoleModel]),
    GroupDomainModule,
    ChurchesDomainModule,
  ],
  controllers: [GroupsController, GroupsRolesController],
  providers: [
    GroupsService,
    GroupRolesService,
    { provide: IGROUPS_DOMAIN_SERVICE, useClass: GroupsDomainService },
    { provide: IGROUP_ROLES_DOMAIN_SERVICE, useClass: GroupRolesDomainService },
  ],
  exports: [
    IGROUP_ROLES_DOMAIN_SERVICE,
    IGROUPS_DOMAIN_SERVICE,
    //GroupsService,
    GroupRolesService,
  ],
})
export class GroupsModule {}
