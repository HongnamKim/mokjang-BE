import { Module } from '@nestjs/common';
import { ChurchesService } from './service/churches.service';
import { ChurchesController } from './controller/churches.controller';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';

@Module({
  imports: [
    UserDomainModule,
    ChurchesDomainModule,
    MembersDomainModule,
    ChurchUserDomainModule,
  ],
  controllers: [ChurchesController /*ChurchJoinController*/],
  providers: [ChurchesService /*ChurchJoinService*/],
})
export class ChurchesModule {}
