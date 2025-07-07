import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MyPageController } from './dto/controller/my-page.controller';
import { MyPageService } from './dto/service/my-page.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me',
        module: MyPageModule,
      },
    ]),
    UserDomainModule,
  ],
  controllers: [MyPageController],
  providers: [MyPageService],
})
export class MyPageModule {}
