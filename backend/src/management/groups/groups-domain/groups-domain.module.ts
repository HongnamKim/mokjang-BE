import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupModel } from '../entity/group.entity';
import { GroupRoleModel } from '../entity/group-role.entity';
import { IGROUPS_DOMAIN_SERVICE } from './interface/groups-domain.service.interface';
import { GroupsDomainService } from './groups-domain.service';
import { IGROUP_ROLES_DOMAIN_SERVICE } from './interface/groups-roles-domain.service.interface';
import { GroupRolesDomainService } from './group-roles-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupModel, GroupRoleModel])],
  providers: [
    { provide: IGROUPS_DOMAIN_SERVICE, useClass: GroupsDomainService },
    {
      provide: IGROUP_ROLES_DOMAIN_SERVICE,
      useClass: GroupRolesDomainService,
    },
  ],
  exports: [IGROUP_ROLES_DOMAIN_SERVICE, IGROUPS_DOMAIN_SERVICE],
})
export class GroupsDomainModule {}
