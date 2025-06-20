import { GetWorshipAttendancesDto } from 'src/worship/dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';
import { QueryRunner } from 'typeorm';

export const IWORSHIP_ATTENDANCE_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ATTENDANCE_DOMAIN_SERVICE',
);

export interface IWorshipAttendanceDomainService {
  findAttendances(
    session: WorshipSessionModel,
    dto: GetWorshipAttendancesDto,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceDomainPaginationResultDto>;
}
