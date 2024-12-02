import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BelieverModel } from './entity/believer.entity';
import { BelieversController } from './controller/believers.controller';
import { BelieversService } from './service/believers.service';
import { ChurchesModule } from '../churches.module';
import { FamilyModel } from './entity/family.entity';
import { FamilyService } from './service/family.service';
import { RouterModule } from '@nestjs/core';
import { BelieversFamilyController } from './controller/believers-family.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BelieverModel, FamilyModel]),
    RouterModule.register([
      { path: 'churches/:churchId/believers', module: BelieversModule },
    ]),
    ChurchesModule,
  ],
  exports: [BelieversService],
  controllers: [BelieversController, BelieversFamilyController],
  providers: [BelieversService, FamilyService],
})
export class BelieversModule {}
