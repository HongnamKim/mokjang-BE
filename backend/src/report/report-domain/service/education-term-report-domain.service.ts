import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationTermReportDomainService } from '../interface/education-term-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermReportModel } from '../../entity/education-term-report.entity';
import {
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationModel } from '../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { EducationTermReportException } from '../../exception/education-term-report.exception';

@Injectable()
export class EducationTermReportDomainService
  implements IEducationTermReportDomainService
{
  constructor(
    @InjectRepository(EducationTermReportModel)
    private readonly repository: Repository<EducationTermReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermReportModel)
      : this.repository;
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

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      educationTermId: educationTerm.id,
    });
  }

  async deleteEducationSessionReports(
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
}
