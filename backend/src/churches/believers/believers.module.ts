import { Module } from '@nestjs/common';
import { BelieversService } from './believers.service';
import { BelieversController } from './believers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationModel } from './entity/invitation.entity';
import { BelieverModel } from './entity/believer.entity';
import { ChurchesModule } from '../churches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationModel, BelieverModel]),
    ChurchesModule,
  ],
  controllers: [BelieversController],
  providers: [BelieversService],
})
export class BelieversModule {}
