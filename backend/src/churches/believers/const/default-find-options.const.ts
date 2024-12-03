import { FindOptionsRelations } from 'typeorm';
import { BelieverModel } from '../entity/believer.entity';

export const DefaultBelieverRelationOption: FindOptionsRelations<BelieverModel> =
  {
    guiding: false,
    guidedBy: true,
    family: {
      familyMember: true,
    },
  };
