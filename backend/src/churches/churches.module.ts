import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { JwtModule } from '@nestjs/jwt';
import { ICHURCHES_DOMAIN_SERVICE } from './churches-domain/interface/churches-domain.service.interface';
import { ChurchesDomainService } from './churches-domain/churhes-domain.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChurchModel]),
    JwtModule.register({}),
    UserDomainModule,
  ],
  controllers: [ChurchesController],
  providers: [
    ChurchesService,
    { provide: ICHURCHES_DOMAIN_SERVICE, useClass: ChurchesDomainService },
  ],
  exports: [ICHURCHES_DOMAIN_SERVICE],
})
export class ChurchesModule {}
