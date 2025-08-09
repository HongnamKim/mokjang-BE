import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../task-report-domain/interface/task-report-domain.service.interface';
import { GetTaskReportDto } from '../dto/get-task-report.dto';
import { TaskReportPaginationResultDto } from '../dto/task-report-pagination-result.dto';
import { QueryRunner } from 'typeorm';
import { GetTaskReportResponseDto } from '../dto/response/get-task-report-response.dto';
import { UpdateTaskReportDto } from '../dto/request/update-task-report.dto';
import { PatchTaskReportResponseDto } from '../dto/response/patch-task-report-response.dto';
import { DeleteTaskReportResponseDto } from '../dto/response/delete-task-report-response.dto';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../../user/user-domain/interface/user-domain.service.interface';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ChurchUserGuard } from '../../../church-user/guard/church-user.guard';

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
  ) {}

  async getTaskReports(churchUser: ChurchUserModel, dto: GetTaskReportDto) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const data = await this.taskReportDomainService.findTaskReportsByReceiver(
      receiver,
      dto,
    );

    return new TaskReportPaginationResultDto(data);
  }

  async getTaskReportById(
    churchUser: ChurchUserModel,
    taskReportId: number,
    qr: QueryRunner,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const report = await this.taskReportDomainService.findTaskReportById(
      receiver,
      taskReportId,
      true,
      qr,
    );

    return new GetTaskReportResponseDto(report);
  }

  async patchTaskReport(
    churchUser: ChurchUserModel,
    taskReportId: number,
    dto: UpdateTaskReportDto,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetTaskReport =
      await this.taskReportDomainService.findTaskReportModelById(
        receiver,
        taskReportId,
      );

    await this.taskReportDomainService.updateTaskReport(targetTaskReport, dto);

    const updatedTaskReport =
      await this.taskReportDomainService.findTaskReportById(
        receiver,
        taskReportId,
        false,
      );

    return new PatchTaskReportResponseDto(updatedTaskReport);
  }

  async deleteTaskReport(churchUser: ChurchUserModel, taskReportId: number) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetReport =
      await this.taskReportDomainService.findTaskReportModelById(
        receiver,
        taskReportId,
      );

    await this.taskReportDomainService.deleteTaskReport(targetReport);

    return new DeleteTaskReportResponseDto(new Date(), taskReportId, true);
  }
}
