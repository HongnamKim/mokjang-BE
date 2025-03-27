import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import { MemberModel } from '../churches/members/entity/member.entity';
import { MembersModule } from '../churches/members/members.module';
import { UserDomainModule } from './user-domain/user-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, MemberModel]),
    JwtModule.register({}),
    MembersModule,
    ChurchesDomainModule,
    UserDomainModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [
    /*UserService*/
  ],
})
export class UserModule {}
