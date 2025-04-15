import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';
import { ChurchJoinRequestsController } from './church-join-requests.controller';

@Module({
  imports: [JwtModule.register({}), UserDomainModule, ChurchesDomainModule],
  controllers: [ChurchesController, ChurchJoinRequestsController],
  providers: [ChurchesService],
})
export class ChurchesModule {}
