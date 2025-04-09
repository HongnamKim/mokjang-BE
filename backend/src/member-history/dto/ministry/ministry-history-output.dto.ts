import { OmitType } from '@nestjs/swagger';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';

export class MinistryHistoryOutputDto extends OmitType(MinistryHistoryModel, [
  'member',
  'ministry',
]) {}
