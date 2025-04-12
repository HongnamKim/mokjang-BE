import { IVisitationReportDomainService } from './visitation-report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationReportModel } from '../../entity/visitation-report.entity';
import { QueryRunner, Repository } from 'typeorm';
import { VisitationMetaModel } from '../../../visitation/entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetVisitationReportDto } from '../../dto/visitation-report/get-visitation-report.dto';
import { NotFoundException } from '@nestjs/common';
import { VisitationReportException } from '../../exception/visitation-report.exception';

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
    sender: MemberModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      visitation,
      sender,
      receiver,
      reportedAt: new Date(),
      isRead: false,
    });
  }

  async findVisitationReportsByReceiver(
    receiver: MemberModel,
    dto: GetVisitationReportDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          receiverId: receiver.id,
          isRead: dto.isRead,
        },
        order: {
          [dto.order]: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
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

  async findVisitationReportById(
    receiver: MemberModel,
    reportId: number,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const report = await repository.findOne({
      where: {
        receiverId: receiver.id,
        id: reportId,
      },
      relations: {
        sender: {
          officer: true,
          group: true,
          groupRole: true,
        },
        visitation: {
          instructor: true,
          members: true,
        },
      },
    });

    if (!report) {
      throw new NotFoundException(VisitationReportException.NOT_FOUND);
    }

    report.isRead = true;

    repository.save(report);

    return report;
  }
}
