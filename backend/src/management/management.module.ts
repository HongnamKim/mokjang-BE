import { Module } from '@nestjs/common';
import { GroupsModule } from './groups/groups.module';
import { OfficersModule } from './officers/officers.module';
import { MinistriesModule } from './ministries/ministries.module';

@Module({
  imports: [GroupsModule, OfficersModule, MinistriesModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ManagementModule {}
