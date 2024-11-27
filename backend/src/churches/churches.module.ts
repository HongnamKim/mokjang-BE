import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { PositionModel } from './entity/position.entity';
import { EducationModel } from './entity/education.entity';
import { MinistryModel } from './entity/ministry.entity';
import { GroupModel } from './entity/group.entity';

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
