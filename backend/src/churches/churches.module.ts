import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { OfficerModel } from './settings/entity/officer.entity';
import { EducationModel } from './settings/entity/education.entity';
import { MinistryModel } from './settings/entity/ministry.entity';
import { GroupModel } from './settings/entity/group.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChurchModel,
      //OfficerModel,
      //EducationModel,
      //MinistryModel,
      //GroupModel,
    ]),
    AuthModule,
  ],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
