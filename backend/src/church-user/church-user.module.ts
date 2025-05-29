import { Module } from '@nestjs/common';
import { ChurchUserController } from './controller/church-user.controller';
import { ChurchUserService } from './service/church-user.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ChurchUserDomainModule } from './church-user-domain/church-user-domain.module';
import { RouterModule } from '@nestjs/core';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

/**
 * 교회에 가입된 계정을 관리하는 모듈
 */
@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: ChurchUserModule },
    ]),
    ChurchesDomainModule,
    UserDomainModule,
    MembersDomainModule,
    ChurchUserDomainModule,
  ],
  controllers: [ChurchUserController],
  providers: [ChurchUserService],
})
export class ChurchUserModule {}
