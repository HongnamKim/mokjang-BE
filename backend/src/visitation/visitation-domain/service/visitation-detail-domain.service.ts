import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { VisitationDetailException } from '../../const/exception/visitation.exception';
import { UpdateVisitationDetailDto } from '../../dto/detail/update-visitation-detail.dto';

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

  async findVisitationDetailByMetaAndMemberId(
    metaData: VisitationMetaModel,
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel> {
    const repository = this.getRepository(qr);

    const detailData = await repository.findOne({
      where: {
        memberId: member.id,
        visitationMetaId: metaData.id,
      },
    });

    if (!detailData) {
      throw new NotFoundException(VisitationDetailException.NOT_FOUND);
    }

    return detailData;
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

  async findVisitationDetailById(
    visitationMeta: VisitationMetaModel,
    visitationDetailId: number,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel> {
    const repository = this.getRepository(qr);

    const detail = await repository.findOne({
      where: {
        visitationMetaId: visitationMeta.id,
        id: visitationDetailId,
      },
      relations: VisitationDetailRelationOptions,
      select: VisitationDetailSelectOptions,
    });

    if (!detail) {
      throw new NotFoundException(VisitationDetailException.NOT_FOUND);
    }

    return detail;
  }

  async findVisitationDetailModelById(
    visitationMeta: VisitationMetaModel,
    visitationDetailId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const visitationDetail = await repository.findOne({
      where: {
        visitationMetaId: visitationMeta.id,
        id: visitationDetailId,
      },
    });

    if (!visitationDetail) {
      throw new NotFoundException(VisitationDetailException.NOT_FOUND);
    }

    return visitationDetail;
  }

  async updateVisitationDetail(
    visitationMeta: VisitationMetaModel,
    visitationDetail: VisitationDetailModel,
    dto: UpdateVisitationDetailDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        visitationMetaId: visitationMeta.id,
        id: visitationDetail.id,
      },
      {
        visitationContent: dto.visitationContent,
        visitationPray: dto.visitationPray,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationDetailException.UPDATE_ERROR,
      );
    }

    return this.findVisitationDetailById(
      visitationMeta,
      visitationDetail.id,
      qr,
    );
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

  async deleteVisitationDetail(
    visitationDetail: VisitationDetailModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(visitationDetail.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationDetailException.DELETE_ERROR,
      );
    }

    return result;
  }
}
