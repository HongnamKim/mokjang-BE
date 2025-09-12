import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationReportDomainService } from '../interface/education-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationReportModel } from '../../entity/education-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { EducationReportException } from '../../exception/education-report.exception';
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
import { EducationReportType } from '../../const/education-report-type.enum';
import { GetEducationTermReportsDto } from '../../dto/term/request/get-education-term-reports.dto';
import { BaseReportFindOptionsSelect } from '../../../base-report/const/base-report-find-options.const';

@Injectable()
export class EducationReportDomainService
  implements IEducationReportDomainService
{
  constructor(
    @InjectRepository(EducationReportModel)
    private readonly repository: Repository<EducationReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationReportModel)
      : this.repository;
  }

  async findEducationSessionReports(
    receiver: MemberModel,
    dto: GetEducationSessionReportDto,
  ): Promise<EducationReportModel[]> {
    const repository = this.getRepository();

    const order: FindOptionsOrder<EducationReportModel> =
      dto.order === ReportOrder.START_DATE || dto.order === ReportOrder.END_DATE
        ? {
            educationSession: {
              [dto.order]: dto.orderDirection,
            },
            id: dto.orderDirection,
          }
        : {
            [dto.order]: dto.orderDirection,
            id: dto.orderDirection,
          };

    return repository.find({
      where: {
        receiverId: receiver.id,
        isRead: dto.isRead && dto.isRead,
        isConfirmed: dto.isConfirmed && dto.isConfirmed,
        educationReportType: EducationReportType.SESSION,
      },
      order,
      relations: EducationReportsFindOptionsRelation,
      select: EducationReportsFindOptionsSelect,
    });
  }

  async findEducationTermReports(
    receiver: MemberModel,
    dto: GetEducationTermReportsDto,
  ) {
    const repository = this.getRepository();

    const order: FindOptionsOrder<EducationReportModel> =
      dto.order === ReportOrder.START_DATE || dto.order === ReportOrder.END_DATE
        ? {
            educationTerm: {
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
        educationReportType: EducationReportType.TERM,
      },
      relations: {
        educationTerm: {
          inCharge: MemberSummarizedRelation,
        },
      },
      select: {
        ...BaseReportFindOptionsSelect,
        educationId: true,
        educationTermId: true,
        educationTerm: {
          id: true,
          educationName: true,
          term: true,
          startDate: true,
          endDate: true,
          status: true,
          inCharge: MemberSummarizedSelect,
        },
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
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
        educationReportType: EducationReportType.SESSION,
      },
    });

    if (alreadyReported.length > 0) {
      throw new ConflictException(
        EducationReportException.FAIL_ADD_REPORT_RECEIVERS,
      );
    }

    const reports = receivers.map((receiver) =>
      repository.create({
        educationId: education.id,
        educationTermId: educationTerm.id,
        educationSession: educationSession,
        educationReportType: EducationReportType.SESSION,
        receiver: receiver.member,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      }),
    );

    return repository.save(reports);
  }

  async createEducationTermReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newReceivers: ChurchUserModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const receiverIds = newReceivers.map((receiver) => receiver.memberId);

    const alreadyReported = await repository.find({
      where: {
        educationTermId: educationTerm.id,
        receiverId: In(receiverIds),
        educationReportType: EducationReportType.TERM,
      },
    });

    if (alreadyReported.length > 0) {
      throw new ConflictException(
        EducationReportException.FAIL_ADD_REPORT_RECEIVERS,
      );
    }

    const reports = repository.create(
      newReceivers.map((receiver) => ({
        educationReportType: EducationReportType.TERM,
        educationId: education.id,
        educationTermId: educationTerm.id,
        receiver: receiver.member,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      })),
    );

    return repository.save(reports);
  }

  async findEducationSessionReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ): Promise<EducationReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(EducationReportException.NOT_FOUND);
    }

    return report;
  }

  async findEducationTermReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
        educationReportType: EducationReportType.TERM,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(EducationReportException.NOT_FOUND);
    }

    return report;
  }

  async findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
        educationReportType: EducationReportType.SESSION,
      },
      relations: EducationReportsFindOptionsRelation,
      select: EducationReportFindOptionsSelect,
    });

    if (!report) {
      throw new NotFoundException(EducationReportException.NOT_FOUND);
    }

    // 읽음 처리
    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }

  async findEducationTermReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
        educationReportType: EducationReportType.TERM,
      },
      relations: {
        educationTerm: {
          inCharge: MemberSummarizedRelation,
        },
      },
      select: {
        ...BaseReportFindOptionsSelect,
        educationReportType: true,
        educationId: true,
        educationTermId: true,
        educationTerm: {
          id: true,
          educationName: true,
          term: true,
          startDate: true,
          endDate: true,
          status: true,
          inCharge: MemberSummarizedSelect,
        },
      },
    });

    if (!report) {
      throw new NotFoundException(EducationReportException.NOT_FOUND);
    }

    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }

  async updateEducationSessionReport(
    targetReport: EducationReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: targetReport.id,
        educationReportType: EducationReportType.SESSION,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationReportException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateEducationTermReport(
    targetReport: EducationReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: targetReport.id,
        educationReportType: EducationReportType.TERM,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationReportException.UPDATE_ERROR,
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
      educationReportType: EducationReportType.SESSION,
    });
  }

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      educationTermId: educationTerm.id,
      educationReportType: EducationReportType.TERM,
    });
  }

  async deleteEducationSessionReport(
    deleteReport: EducationReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({
      id: deleteReport.id,
      educationReportType: EducationReportType.SESSION,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationTermReport(
    targetReport: EducationReportModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({
      id: targetReport.id,
      educationReportType: EducationReportType.TERM,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationSessionReports(
    targetReports: EducationReportModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportIds = targetReports.map((report) => report.id);

    const result = await repository.softDelete({
      id: In(reportIds),
      educationReportType: EducationReportType.SESSION,
    });

    if (result.affected !== targetReports.length) {
      throw new InternalServerErrorException(
        EducationReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationTermReports(
    targetReports: EducationReportModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportIds = targetReports.map((report) => report.id);

    const result = await repository.softDelete({
      id: In(reportIds),
      educationReportType: EducationReportType.TERM,
    });

    if (result.affected !== targetReports.length) {
      throw new InternalServerErrorException(
        EducationReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async findEducationSessionReportModelsByReceiverIds(
    educationSession: EducationSessionModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const reports = await repository.find({
      where: {
        educationSessionId: educationSession.id,
        receiverId: In(receiverIds),
        educationReportType: EducationReportType.SESSION,
      },
      relations: relationOptions,
    });

    if (reports.length !== receiverIds.length) {
      throw new NotFoundException(
        EducationReportException.NOT_EXIST_REPORTED_MEMBERS,
      );
    }

    return reports;
  }

  async findEducationTermReportModelsByReceiverIds(
    educationTerm: EducationTermModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const reports = await repository.find({
      where: {
        educationTermId: educationTerm.id,
        educationSessionId: IsNull(),
        educationReportType: EducationReportType.TERM,
        receiverId: In(receiverIds),
      },
      relations: relationOptions,
    });

    if (reports.length !== receiverIds.length) {
      throw new NotFoundException(
        EducationReportException.NOT_EXIST_REPORTED_MEMBERS,
      );
    }

    return reports;
  }

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationReportModel[]> {
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
