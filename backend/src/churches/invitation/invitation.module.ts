import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationModel } from './entity/invitation.entity';
import { BelieverModel } from '../believers/entity/believer.entity';
import { ChurchesModule } from '../churches.module';
import { BelieversModule } from '../believers/believers.module';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationModel, BelieverModel]),
    ChurchesModule,
    BelieversModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService, MessagesService],
})
export class InvitationModule {}
