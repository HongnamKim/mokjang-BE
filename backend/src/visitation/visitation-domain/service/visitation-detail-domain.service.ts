import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IVisitationDetailDomainService } from '../interface/visitation-detail-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationDetailModel } from '../../entity/visitation-detail.entity';
import {
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import {
  VisitationDetailRelationOptions,
  VisitationDetailSelectOptions,
} from '../../const/visitation-find-options.const';
import { VisitationDetailException } from '../../const/exception/visitation.exception';
import { UpdateVisitationDetailDto } from '../../dto/internal/detail/update-visitation-detail.dto';
import { VisitationDetailDto } from '../../dto/internal/visittion-detail.dto';

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

  async createAddedMemberDetails(
    metaData: VisitationMetaModel,
    //memberIds: number[],
    members: MemberModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const details = repository.create(
      members.map((member) => ({
        visitationMeta: metaData,
        memberId: member.id,
      })),
    );

    await repository.save(details);
  }

  async deleteRemovedMemberDetails(
    metaData: VisitationMetaModel,
    memberIds: number[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    await repository.softDelete({
      visitationMetaId: metaData.id,
      memberId: In(memberIds),
    });
  }

  async createVisitationDetails(
    metaData: VisitationMetaModel,
    members: MemberModel[],
    dto: VisitationDetailDto[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const details = repository.create(
      members.map((member) => {
        const detail = dto.find((detail) => detail.memberId === member.id);

        if (!detail) {
          throw new InternalServerErrorException();
        }

        return {
          visitationMetaId: metaData.id,
          memberId: member.id,
          visitationContent: detail.visitationContent,
          visitationPray: detail.visitationPray,
        };
      }),
    );

    return repository.save(details);
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
      relations: VisitationDetailRelationOptions,
      select: VisitationDetailSelectOptions,
    });

    if (!detailData) {
      throw new NotFoundException(VisitationDetailException.NOT_FOUND);
    }

    return detailData;
  }

  async findVisitationDetailsByMetaId(
    metaData: VisitationMetaModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationDetailModel>,
  ) {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        visitationMetaId: metaData.id,
      },
      relations: relationOptions,
    });
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

    return result;
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
