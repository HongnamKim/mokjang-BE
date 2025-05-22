import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserDomainModule } from './user-domain/user-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';

@Module({
  imports: [UserDomainModule, ChurchesDomainModule, MembersDomainModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
