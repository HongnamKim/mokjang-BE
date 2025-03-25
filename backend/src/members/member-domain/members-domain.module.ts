import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from '../entity/member.entity';
import { IMEMBERS_DOMAIN_SERVICE } from './service/interface/members-domain.service.interface';
import { MembersDomainService } from './service/members-domain.service';
import { IDUMMY_MEMBERS_DOMAIN_SERVICE } from './service/interface/dummy-members-domain.service.interface';
import { DummyMembersDomainService } from './service/dummy-members-domain.service';

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
  ],
  exports: [IMEMBERS_DOMAIN_SERVICE, IDUMMY_MEMBERS_DOMAIN_SERVICE],
})
export class MembersDomainModule {}
