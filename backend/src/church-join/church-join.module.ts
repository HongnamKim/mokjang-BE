import { Module } from '@nestjs/common';
import { ChurchJoinController } from './controller/church-join.controller';
import { ChurchJoinService } from './service/church-join.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchJoinDomainModule } from './church-join-domain/church-join-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';

import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    UserDomainModule,
    ChurchesDomainModule,
    ChurchJoinDomainModule,
    ChurchUserDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
  ],
  controllers: [ChurchJoinController],
  providers: [ChurchJoinService],
})
export class ChurchJoinModule {}
