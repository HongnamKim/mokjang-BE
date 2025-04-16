import { Module } from '@nestjs/common';
import { ChurchesService } from './service/churches.service';
import { ChurchesController } from './controller/churches.controller';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';
import { ChurchJoinRequestsController } from './controller/church-join-requests.controller';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchJoinRequestService } from './service/church-join-request.service';

@Module({
  imports: [UserDomainModule, ChurchesDomainModule, MembersDomainModule],
  controllers: [ChurchesController, ChurchJoinRequestsController],
  providers: [ChurchesService, ChurchJoinRequestService],
})
export class ChurchesModule {}
