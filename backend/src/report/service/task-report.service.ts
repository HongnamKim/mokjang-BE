import { Inject, Injectable } from '@nestjs/common';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../report-domain/interface/task-report-domain.service.interface';

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
  ) {}
}
