import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationSessionReportDomainService } from '../interface/education-session-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionReportModel } from '../../entity/education-session-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { EducationSessionReportException } from '../../exception/education-session-report.exception';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { differenceInDays } from 'date-fns';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../members/const/member-find-options.const';
import { EducationModel } from '../../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../../educations/education-term/entity/education-term.entity';
import { EducationSessionModel } from '../../../../educations/education-session/entity/education-session.entity';
import { ReportOrder } from '../../../base-report/const/report-order.enum';
import { GetEducationSessionReportDto } from '../../dto/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../../dto/session/request/update-education-session-report.dto';
import {
  EducationReportFindOptionsSelect,
  EducationReportsFindOptionsRelation,
  EducationReportsFindOptionsSelect,
} from '../../const/education-session-find-options.const';

@Injectable()
export class EducationSessionReportDomainService
  implements IEducationSessionReportDomainService
{
  constructor(
    @InjectRepository(EducationSessionReportModel)
    private readonly repository: Repository<EducationSessionReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionReportModel)
      : this.repository;
  }

  async findEducationSessionReports(
    receiver: MemberModel,
    dto: GetEducationSessionReportDto,
  ): Promise<EducationSessionReportModel[]> {
    const repository = this.getRepository();

    const order: FindOptionsOrder<EducationSessionReportModel> =
      dto.order === ReportOrder.START_DATE || dto.order === ReportOrder.END_DATE
        ? {
            educationSession: {
              [dto.order]: dto.orderDirection,
            },
          }
        : {
            [dto.order]: dto.orderDirection,
          };

    return repository.find({
      where: {
        receiverId: receiver.id,
        isRead: dto.isRead && dto.isRead,
        isConfirmed: dto.isConfirmed && dto.isConfirmed,
      },
      order,
      relations: EducationReportsFindOptionsRelation,
      select: EducationReportsFindOptionsSelect,
    });
  }

  async createEducationSessionReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receivers: ChurchUserModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const receiverIds = receivers.map((receiver) => receiver.memberId);

    const alreadyReported = await repository.find({
      where: {
        educationSessionId: educationSession.id,
        receiverId: In(receiverIds),
      },
    });

    if (alreadyReported.length > 0) {
      throw new ConflictException(
        EducationSessionReportException.FAIL_ADD_REPORT_RECEIVERS,
      );
    }

    const reports = receivers.map((receiver) =>
      repository.create({
        educationId: education.id,
        educationTermId: educationTerm.id,
        educationSession: educationSession,
        receiver: receiver.member,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      }),
    );

    return repository.save(reports);
  }

  async findEducationSessionReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionReportModel>,
  ): Promise<EducationSessionReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(EducationSessionReportException.NOT_FOUND);
    }

    return report;
  }

  async findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationSessionReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: EducationReportsFindOptionsRelation,
      select: EducationReportFindOptionsSelect,
    });

    if (!report) {
      throw new NotFoundException(EducationSessionReportException.NOT_FOUND);
    }

    // 읽음 처리
    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }

  async updateEducationSessionReport(
    targetReport: EducationSessionReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: targetReport.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionReportException.UPDATE_ERROR,
      );
    }

    return result;
  }

  deleteEducationSessionReportsCascade(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      educationSessionId: educationSession.id,
    });
  }

  async deleteEducationSessionReport(
    deleteReport: EducationSessionReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(deleteReport);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationSessionReports(
    targetReports: EducationSessionReportModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportIds = targetReports.map((report) => report.id);

    const result = await repository.softDelete(reportIds);

    if (result.affected !== targetReports.length) {
      throw new InternalServerErrorException(
        EducationSessionReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async findEducationSessionReportModelsByReceiverIds(
    educationSession: EducationSessionModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const reports = await repository.find({
      where: {
        educationSessionId: educationSession.id,
        receiverId: In(receiverIds),
      },
      relations: relationOptions,
    });

    if (reports.length !== receiverIds.length) {
      throw new NotFoundException(
        EducationSessionReportException.NOT_EXIST_REPORTED_MEMBERS,
      );
    }

    return reports;
  }

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationSessionReportModel[]> {
    const repository = this.getRepository();

    const take = differenceInDays(to, from) > 14 ? 100 : 50;

    return repository.find({
      take,
      where: {
        receiverId: receiver.id,
        educationSession: {
          startDate: LessThanOrEqual(to),
          endDate: MoreThanOrEqual(from),
        },
      },
      order: {
        educationSession: {
          endDate: 'ASC',
        },
      },
      relations: {
        educationSession: {
          inCharge: MemberSummarizedRelation,
          educationTerm: true,
        },
      },
      select: {
        educationSession: {
          id: true,
          createdAt: true,
          updatedAt: true,
          session: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
          inCharge: MemberSummarizedSelect,
          educationTerm: {
            id: true,
            educationId: true,
          },
        },
      },
    });
  }
}
