import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from '../entity/member.entity';
import { IMEMBERS_DOMAIN_SERVICE } from './interface/members-domain.service.interface';
import { MembersDomainService } from './service/members-domain.service';
import { IDUMMY_MEMBERS_DOMAIN_SERVICE } from './interface/dummy-members-domain.service.interface';
import { DummyMembersDomainService } from './service/dummy-members-domain.service';
import { IMINISTRY_MEMBERS_DOMAIN_SERVICE } from './interface/ministry-members-domain.service.interface';
import { MinistryMembersDomainService } from './service/ministry-members-domain.service';
import { IOFFICER_MEMBERS_DOMAIN_SERVICE } from './interface/officer-members-domain.service.interface';
import { OfficerMembersDomainService } from './service/officer-members-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberModel])],
  providers: [
    {
      provide: IMEMBERS_DOMAIN_SERVICE,
      useClass: MembersDomainService,
    },
    {
      provide: IDUMMY_MEMBERS_DOMAIN_SERVICE,
      useClass: DummyMembersDomainService,
    },
    {
      provide: IMINISTRY_MEMBERS_DOMAIN_SERVICE,
      useClass: MinistryMembersDomainService,
    },
    {
      provide: IOFFICER_MEMBERS_DOMAIN_SERVICE,
      useClass: OfficerMembersDomainService,
    },
  ],
  exports: [
    IMEMBERS_DOMAIN_SERVICE,
    IDUMMY_MEMBERS_DOMAIN_SERVICE,
    IMINISTRY_MEMBERS_DOMAIN_SERVICE,
    IOFFICER_MEMBERS_DOMAIN_SERVICE,
  ],
})
export class MembersDomainModule {}
