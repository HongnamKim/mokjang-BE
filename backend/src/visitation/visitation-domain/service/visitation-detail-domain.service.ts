import { Injectable } from '@nestjs/common';
import { IVisitationDetailDomainService } from './interface/visitation-detail-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationDetailModel } from '../../entity/visitation-detail.entity';
import { QueryRunner, Repository } from 'typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { VisitationDetailDto } from '../../dto/visitation-detail.dto';

@Injectable()
export class VisitationDetailDomainService
  implements IVisitationDetailDomainService
{
  constructor(
    @InjectRepository(VisitationDetailModel)
    private readonly repository: Repository<VisitationDetailModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(VisitationDetailModel)
      : this.repository;
  }

  async createVisitationDetail(
    metaData: VisitationMetaModel,
    member: MemberModel,
    dto: VisitationDetailDto,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      visitationMeta: metaData,
      member,
      visitationContent: dto.visitationContent,
      visitationPray: dto.visitationPray,
    });
  }
}
