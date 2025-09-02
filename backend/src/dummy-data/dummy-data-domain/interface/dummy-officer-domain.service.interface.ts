import { ChurchModel } from '../../../churches/entity/church.entity';
import { DeleteResult, QueryRunner } from 'typeorm';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';

export const IDUMMY_OFFICER_DOMAIN_SERVICE = Symbol(
  'IDUMMY_OFFICER_DOMAIN_SERVICE',
);

export interface IDummyOfficerDomainService {
  createDummyOfficers(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<OfficerModel[]>;

  deleteDummyOfficersCascade(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<DeleteResult>;
}
