import { IVisitationReportDomainService } from '../interface/visitation-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationReportModel } from '../../entity/visitation-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { VisitationMetaModel } from '../../../visitation/entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetVisitationReportDto } from '../../dto/visitation-report/get-visitation-report.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VisitationReportException } from '../../const/exception/visitation-report.exception';
import { UpdateVisitationReportDto } from '../../dto/visitation-report/update-visitation-report.dto';
import { ReportModel } from '../../entity/report.entity';
import { VisitationReportOrderEnum } from '../../const/visitation-report-order.enum';
import {
  VisitationReportFindOptionsRelation,
  VisitationReportFindOptionsSelect,
  VisitationReportsFindOptionsRelation,
  VisitationReportsFindOptionsSelect,
} from '../../const/report-find-options.const';

export class VisitationReportDomainService
  implements IVisitationReportDomainService
{
  constructor(
    @InjectRepository(VisitationReportModel)
    private readonly visitationReportRepository: Repository<VisitationReportModel>,
  ) {}

  private getRepository = (qr?: QueryRunner) =>
    qr
      ? qr.manager.getRepository(VisitationReportModel)
      : this.visitationReportRepository;

  createVisitationReport(
    visitation: VisitationMetaModel,
    //sender: MemberModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      visitation,
      //senderId: sender ? sender.id : undefined,
      receiver,
      reportedAt: new Date(),
      isRead: false,
      isConfirmed: false,
    });
  }

  async findVisitationReportsByReceiver(
    receiver: MemberModel,
    dto: GetVisitationReportDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const order: FindOptionsOrder<VisitationReportModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== VisitationReportOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          receiverId: receiver.id,
          isRead: dto.isRead,
        },
        relations: VisitationReportsFindOptionsRelation,
        select: VisitationReportsFindOptionsSelect,
        order,
      }),
      repository.count({
        where: {
          receiverId: receiver.id,
          isRead: dto.isRead,
        },
      }),
    ]);

    return { data, totalCount };
  }

  async findVisitationReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationReportModel>,
  ): Promise<VisitationReportModel> {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: relationOptions,
    });

    if (!report) {
      throw new NotFoundException(VisitationReportException.NOT_FOUND);
    }

    return report;
  }

  async findVisitationReportById(
    receiver: MemberModel,
    reportId: number,
    isRead: boolean,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: VisitationReportFindOptionsRelation,
      select: VisitationReportFindOptionsSelect,
    });

    if (!report) {
      throw new NotFoundException(VisitationReportException.NOT_FOUND);
    }

    if (isRead) {
      report.isRead = true;
      await repository.save(report);
    }

    /*isRead && (report.isRead = true);

    isRead && repository.save(report);*/

    return report;
  }

  async updateVisitationReport(
    visitationReport: VisitationReportModel,
    dto: UpdateVisitationReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      { id: visitationReport.id },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationReportException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteVisitationReport(
    visitationReport: VisitationReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: visitationReport.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationReportException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteVisitationReports(
    visitationReports: ReportModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportIds = visitationReports.map((r) => r.id);

    return repository.softDelete(reportIds);
  }
}
