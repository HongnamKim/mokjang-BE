import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';

@Module({
  imports: [JwtModule.register({}), UserDomainModule, ChurchesDomainModule],
  controllers: [ChurchesController],
  providers: [ChurchesService],
})
export class ChurchesModule {}
