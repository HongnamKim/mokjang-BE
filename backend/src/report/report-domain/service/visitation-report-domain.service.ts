import { IVisitationReportDomainService } from '../interface/visitation-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationReportModel } from '../../entity/visitation-report.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { VisitationMetaModel } from '../../../visitation/entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetVisitationReportDto } from '../../dto/visitation-report/get-visitation-report.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VisitationReportException } from '../../const/exception/visitation-report.exception';
import { UpdateVisitationReportDto } from '../../dto/visitation-report/update-visitation-report.dto';
import { VisitationReportOrderEnum } from '../../const/visitation-report-order.enum';
import {
  VisitationReportFindOptionsRelation,
  VisitationReportFindOptionsSelect,
  VisitationReportsFindOptionsRelation,
  VisitationReportsFindOptionsSelect,
} from '../../const/report-find-options.const';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { MAX_RECEIVER_COUNT } from '../../const/report.constraints';
import { TaskReportException } from '../../const/exception/task-report.exception';
import { AddConflictExceptionV2 } from '../../../common/exception/add-conflict.exception';
import { RemoveConflictException } from '../../../common/exception/remove-conflict.exception';

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

  async createVisitationReports(
    visitation: VisitationMetaModel,
    newReceivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<VisitationReportModel[]> {
    const repository = this.getRepository(qr);

    const oldReports = await repository.find({
      where: { visitationId: visitation.id },
    });
    const oldReceiverIds = new Set(
      oldReports.map((report) => report.receiverId),
    );

    if (oldReports.length + newReceivers.length > MAX_RECEIVER_COUNT) {
      throw new ConflictException(VisitationReportException.EXCEED_RECEIVERS);
    }

    const failed: { receiverId: number; reason: string }[] = [];

    for (const receiver of newReceivers) {
      if (oldReceiverIds.has(receiver.member.id)) {
        failed.push({
          receiverId: receiver.member.id,
          reason: TaskReportException.ALREADY_REPORTED_MEMBER,
        });
      }
    }

    if (failed.length > 0) {
      throw new AddConflictExceptionV2('피보고자 추가 실패', failed);
    }

    const reports = newReceivers.map((receiver) =>
      repository.create({
        visitation: visitation,
        receiver: receiver.member,
        reportedAt: new Date(),
        isRead: false,
        isConfirmed: false,
      }),
    );

    return repository.save(reports);
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

  deleteVisitationReportCascade(
    visitation: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({ visitationId: visitation.id });
  }

  async deleteVisitationReports(
    visitation: VisitationMetaModel,
    receiverIds: number[],
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const reports = await repository.find({
      where: {
        visitationId: visitation.id,
      },
    });

    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const notExistReceiverIds = receiverIds.filter(
      (id) => !oldReceiverIds.has(id),
    );

    if (notExistReceiverIds.length > 0) {
      throw new RemoveConflictException(
        VisitationReportException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceiverIds,
      );
    }

    const result = await repository.softDelete({
      visitationId: visitation.id,
      receiverId: In(receiverIds),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationReportException.DELETE_ERROR,
      );
    }

    return result;
  }
}
