import { Inject, Injectable } from '@nestjs/common';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../report-domain/interface/task-report-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { GetTaskReportDto } from '../dto/task-report/get-task-report.dto';
import { TaskReportPaginationResultDto } from '../dto/task-report/task-report-pagination-result.dto';
import { QueryRunner } from 'typeorm';
import { GetTaskReportResponseDto } from '../dto/task-report/response/get-task-report-response.dto';
import { UpdateTaskReportDto } from '../dto/task-report/request/update-task-report.dto';
import { PatchTaskReportResponseDto } from '../dto/task-report/response/patch-task-report-response.dto';
import { DeleteTaskReportResponseDto } from '../dto/task-report/response/delete-task-report-response.dto';

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
  ) {}

  async getTaskReports(
    churchId: number,
    memberId: number,
    dto: GetTaskReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      undefined,
      { user: true },
    );

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
    churchId: number,
    memberId: number,
    taskReportId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      { user: true },
    );

    const report = await this.taskReportDomainService.findTaskReportById(
      receiver,
      taskReportId,
      true,
      qr,
    );

    return new GetTaskReportResponseDto(report);
  }

  async patchTaskReport(
    churchId: number,
    memberId: number,
    taskReportId: number,
    dto: UpdateTaskReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

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

  async deleteTaskReport(
    churchId: number,
    receiverId: number,
    taskReportId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      receiverId,
    );

    const targetReport =
      await this.taskReportDomainService.findTaskReportModelById(
        receiver,
        taskReportId,
      );

    await this.taskReportDomainService.deleteTaskReport(targetReport);

    return new DeleteTaskReportResponseDto(new Date(), taskReportId, true);
  }
}
