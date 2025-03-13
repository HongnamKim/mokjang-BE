import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from '../entity/church.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchModel])],
  providers: [],
  exports: [],
})
export class ChurchesDomainModule {}
