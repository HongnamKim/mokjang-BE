import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BelieverModel } from './entity/believer.entity';
import { BelieversController } from './believers.controller';
import { BelieversService } from './believers.service';
import { ChurchesModule } from '../churches.module';

@Module({
  imports: [TypeOrmModule.forFeature([BelieverModel]), ChurchesModule],
  exports: [BelieversService],
  controllers: [BelieversController],
  providers: [BelieversService],
})
export class BelieversModule {}
