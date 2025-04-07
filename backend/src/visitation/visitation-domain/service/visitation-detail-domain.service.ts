import { Injectable } from '@nestjs/common';
import { IVisitationDetailDomainService } from './interface/visitation-detail-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationDetailModel } from '../../entity/visitation-detail.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { VisitationDetailDto } from '../../dto/visitation-detail.dto';
import {
  VisitationDetailRelationOptions,
  VisitationDetailSelectOptions,
} from '../../const/visitation-find-options.const';

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

  async findVisitationDetailsByMetaId(
    metaData: VisitationMetaModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        visitationMetaId: metaData.id,
      },
      relations: VisitationDetailRelationOptions,
      select: VisitationDetailSelectOptions,
    });
  }

  async deleteVisitationDetailsCascade(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      visitationMetaId: metaData.id,
    });
  }
}
