import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../../church-user/church-user-domain/service/interface/church-user-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';

@Injectable()
export class TaskReportService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  async getTaskReports(userId: number, dto: GetTaskReportDto) {
    const user = await this.userDomainService.findUserById(userId);

    const currentChurchUser = user.churchUser.find(
      (churchUser) => churchUser.leftAt === null,
    );

    if (!currentChurchUser) {
      throw new BadRequestException('교회에 가입되지 않은 사용자');
    }

    const { data, totalCount } =
      await this.taskReportDomainService.findTaskReportsByReceiver(
        currentChurchUser.member,
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
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      //{ user: true },
    );*/
    const user = await this.userDomainService.findUserById(userId);

    const currentChurchUser = user.churchUser.find(
      (churchUser) => churchUser.leftAt === null,
    );

    if (!currentChurchUser) {
      throw new BadRequestException('교회에 가입되지 않은 사용자');
    }

    const report = await this.taskReportDomainService.findTaskReportById(
      //receiver,
      currentChurchUser.member,
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
