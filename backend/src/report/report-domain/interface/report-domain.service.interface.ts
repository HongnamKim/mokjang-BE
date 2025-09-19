import { MemberModel } from '../../../members/entity/member.entity';
import { QueryRunner } from 'typeorm';
import { GetMyReportsDto } from '../../../home/dto/request/get-my-reports.dto';

export const IREPORT_DOMAIN_SERVICE = Symbol('IREPORT_DOMAIN_SERVICE');

export interface IReportDomainService {
  paginateReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
    dto: GetMyReportsDto,
    qr?: QueryRunner,
  ): any;
}
