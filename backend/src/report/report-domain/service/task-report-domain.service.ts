import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskReportModel } from '../../entity/task-report.entity';
import { Repository } from 'typeorm';
import { ITaskReportDomainService } from '../interface/task-report-domain.service.interface';

@Injectable()
export class TaskReportDomainService implements ITaskReportDomainService {
  constructor(
    @InjectRepository(TaskReportModel)
    private readonly taskReportRepository: Repository<TaskReportModel>,
  ) {}
}
