import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { PositionModel } from './settings/entity/position.entity';
import { EducationModel } from './settings/entity/education.entity';
import { MinistryModel } from './settings/entity/ministry.entity';
import { GroupModel } from './settings/entity/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChurchModel,
      PositionModel,
      EducationModel,
      MinistryModel,
      GroupModel,
    ]),
  ],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
