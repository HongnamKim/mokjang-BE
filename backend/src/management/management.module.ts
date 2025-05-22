import { Module } from '@nestjs/common';
import { GroupsModule } from './groups/groups.module';
import { OfficersModule } from './officers/officers.module';
import { MinistriesModule } from './ministries/ministries.module';
import { EducationsModule } from './educations/educations.module';

@Module({
  imports: [GroupsModule, OfficersModule, MinistriesModule, EducationsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ManagementModule {}
