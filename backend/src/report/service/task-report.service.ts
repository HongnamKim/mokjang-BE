import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../report-domain/interface/task-report-domain.service.interface';
import { GetTaskReportDto } from '../dto/task-report/get-task-report.dto';
import { TaskReportPaginationResultDto } from '../dto/task-report/task-report-pagination-result.dto';
import { QueryRunner } from 'typeorm';
import { GetTaskReportResponseDto } from '../dto/task-report/response/get-task-report-response.dto';
import { UpdateTaskReportDto } from '../dto/task-report/request/update-task-report.dto';
import { PatchTaskReportResponseDto } from '../dto/task-report/response/patch-task-report-response.dto';
import { DeleteTaskReportResponseDto } from '../dto/task-report/response/delete-task-report-response.dto';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  private async getCurrentMember(userId: number) {
    const user = await this.userDomainService.findUserById(userId);

    const currentChurchUser = user.churchUser.find(
      (churchUser) => churchUser.leftAt === null,
    );

    if (!currentChurchUser) {
      throw new ForbiddenException('교회에 가입되지 않은 사용자');
    }

    if (!currentChurchUser.member) {
      throw new ForbiddenException('교인 정보 없음');
    }

    return currentChurchUser.member;
  }

  async getTaskReports(userId: number, dto: GetTaskReportDto) {
    const receiver = await this.getCurrentMember(userId);

    const { data, totalCount } =
      await this.taskReportDomainService.findTaskReportsByReceiver(
        receiver,
        dto,
      );

    return new TaskReportPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getTaskReportById(
    userId: number,
    taskReportId: number,
    qr: QueryRunner,
  ) {
    const receiver = await this.getCurrentMember(userId);

    const report = await this.taskReportDomainService.findTaskReportById(
      receiver,
      taskReportId,
      true,
      qr,
    );

    return new GetTaskReportResponseDto(report);
  }

  async patchTaskReport(
    userId: number,
    taskReportId: number,
    dto: UpdateTaskReportDto,
  ) {
    const receiver = await this.getCurrentMember(userId);

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

  async deleteTaskReport(userId: number, taskReportId: number) {
    const receiver = await this.getCurrentMember(userId);

    const targetReport =
      await this.taskReportDomainService.findTaskReportModelById(
        receiver,
        taskReportId,
      );

    await this.taskReportDomainService.deleteTaskReport(targetReport);

    return new DeleteTaskReportResponseDto(new Date(), taskReportId, true);
  }
}
