import { Module } from '@nestjs/common';
import { DummyDataService } from './dummy-data.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { DummyDataController } from './dummy-data.controller';
import { DummyDataDomainModule } from './dummy-data-domain/dummy-data-domain.module';

@Module({
  imports: [ChurchesDomainModule, GroupsDomainModule, DummyDataDomainModule],
  providers: [DummyDataService],
  controllers: [DummyDataController],
  exports: [],
})
export class DummyDataModule {}
