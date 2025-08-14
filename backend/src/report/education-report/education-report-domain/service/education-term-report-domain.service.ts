import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationTermReportDomainService } from '../interface/education-term-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
//import { EducationTermReportModel } from '../../entity/education-term-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationModel } from '../../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../../educations/education-term/entity/education-term.entity';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { EducationTermReportException } from '../../exception/education-term-report.exception';
import { MemberModel } from '../../../../members/entity/member.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../members/const/member-find-options.const';
import { BaseReportFindOptionsSelect } from '../../../base-report/const/base-report-find-options.const';
import { ReportOrder } from '../../../base-report/const/report-order.enum';
import { GetEducationTermReportsDto } from '../../dto/term/request/get-education-term-reports.dto';
import { UpdateEducationTermReportDto } from '../../dto/term/request/update-education-term-report.dto';

@Injectable()
export class EducationTermReportDomainService
  implements IEducationTermReportDomainService {
  /*constructor(
    @InjectRepository(EducationTermReportModel)
    private readonly repository: Repository<EducationTermReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermReportModel)
      : this.repository;
  }

  findEducationTermReports(
    currentMember: MemberModel,
    dto: GetEducationTermReportsDto,
    qr?: QueryRunner,
  ): Promise<EducationTermReportModel[]> {
    const repository = this.getRepository(qr);

    const order: FindOptionsOrder<EducationTermReportModel> =
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
        receiverId: currentMember.id,
        isRead: dto.isRead && dto.isRead,
        isConfirmed: dto.isConfirmed && dto.isConfirmed,
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

  async findEducationTermReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(EducationTermReportException.NOT_FOUND);
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
    });

    if (!report) {
      throw new NotFoundException(EducationTermReportException.NOT_FOUND);
    }

    if (checkIsRead) {
      report.isRead = true;
      await repository.save(report);
    }

    return report;
  }

  async findEducationTermReportModelsByReceiverIds(
    educationTerm: EducationTermModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermReportModel>,
  ) {
    const repository = this.getRepository(qr);

    const reports = await repository.find({
      where: {
        educationTermId: educationTerm.id,
        receiverId: In(receiverIds),
      },
      relations: relationOptions,
    });

    if (reports.length !== receiverIds.length) {
      throw new NotFoundException(
        EducationTermReportException.NOT_EXIST_REPORTED_MEMBERS,
      );
    }

    return reports;
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
      },
    });

    if (alreadyReported.length > 0) {
      throw new ConflictException(
        EducationTermReportException.FAIL_ADD_REPORT_RECEIVERS,
      );
    }

    const reports = repository.create(
      newReceivers.map((receiver) => ({
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

  async updateEducationTermReport(
    targetReport: EducationTermReportModel,
    dto: UpdateEducationTermReportDto,
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
        EducationTermReportException.UPDATE_ERROR,
      );
    }

    return result;
  }

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      educationTermId: educationTerm.id,
    });
  }

  async deleteEducationTermReports(
    targetReports: EducationTermReportModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportIds = targetReports.map((report) => report.id);

    const result = await repository.softDelete(reportIds);

    if (result.affected !== targetReports.length) {
      throw new InternalServerErrorException(
        EducationTermReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationTermReport(
    targetReport: EducationTermReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(targetReport);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermReportException.DELETE_ERROR,
      );
    }

    return result;
  }*/
}
