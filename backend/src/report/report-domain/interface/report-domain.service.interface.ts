import { MemberModel } from '../../../members/entity/member.entity';
import { QueryRunner } from 'typeorm';

export const IREPORT_DOMAIN_SERVICE = Symbol('IREPORT_DOMAIN_SERVICE');

export interface IReportDomainService {
  paginateReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
    qr?: QueryRunner,
  ): Promise<any[]>;
}
