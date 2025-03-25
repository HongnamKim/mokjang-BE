import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import { UserDomainModule } from './user-domain/user-domain.module';
import { ChurchModel } from '../churches/entity/church.entity';
import { MemberModel } from '../members/entity/member.entity';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, MemberModel, ChurchModel]),
    JwtModule.register({}),
    MembersModule,
    UserDomainModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
