import { Module } from '@nestjs/common';
import { IDUMMY_MEMBERS_DOMAIN_SERVICE } from './interface/dummy-members-domain.service.interface';
import { DummyMembersDomainService } from './service/dummy-members-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { IDUMMY_OFFICER_DOMAIN_SERVICE } from './interface/dummy-officer-domain.service.interface';
import { DummyOfficerDomainService } from './service/dummy-officer-domain.service';
import { OfficerModel } from '../../management/officers/entity/officer.entity';
import { IDUMMY_GROUP_DOMAIN_SERVICE } from './interface/dummy-group-domain.service.interface';
import { DummyGroupDomainService } from './service/dummy-group-domain.service';
import { GroupModel } from '../../management/groups/entity/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberModel, OfficerModel, GroupModel])],
  providers: [
    {
      provide: IDUMMY_MEMBERS_DOMAIN_SERVICE,
      useClass: DummyMembersDomainService,
    },
    {
      provide: IDUMMY_OFFICER_DOMAIN_SERVICE,
      useClass: DummyOfficerDomainService,
    },
    {
      provide: IDUMMY_GROUP_DOMAIN_SERVICE,
      useClass: DummyGroupDomainService,
    },
  ],
  exports: [
    IDUMMY_MEMBERS_DOMAIN_SERVICE,
    IDUMMY_OFFICER_DOMAIN_SERVICE,
    IDUMMY_GROUP_DOMAIN_SERVICE,
  ],
})
export class DummyDataDomainModule {}
