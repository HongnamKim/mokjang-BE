import { Module } from '@nestjs/common';
import { MinistryHistoryModule } from './ministry-history/ministry-history.module';
import { OfficerHistoryModule } from './officer-history/officer-history.module';
import { GroupHistoryModule } from './group-history/group-history.module';
import { EducationHistoryModule } from './education-history/education-history.module';

@Module({
  imports: [
    MinistryHistoryModule,
    OfficerHistoryModule,
    GroupHistoryModule,
    EducationHistoryModule,
  ],
})
export class MemberHistoryModule {}
