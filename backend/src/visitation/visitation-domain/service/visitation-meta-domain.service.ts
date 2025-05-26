import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IVisitationMetaDomainService } from '../interface/visitation-meta-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import {
  Between,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateVisitationMetaDto } from '../../dto/internal/meta/create-visitation-meta.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { VisitationException } from '../../const/exception/visitation.exception';
import { UpdateVisitationMetaDto } from '../../dto/internal/meta/update-visitation-meta.dto';
import { GetVisitationDto } from '../../dto/get-visitation.dto';
import {
  VisitationRelationOptions,
  VisitationSelectOptions,
} from '../../const/visitation-find-options.const';

@Injectable()
export class VisitationMetaDomainService
  implements IVisitationMetaDomainService
{
  constructor(
    @InjectRepository(VisitationMetaModel)
    private readonly visitationMetaRepository: Repository<VisitationMetaModel>,
  ) {}

  private getVisitationMetaRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(VisitationMetaModel)
      : this.visitationMetaRepository;
  }

  private parseVisitationDate(dto: GetVisitationDto) {
    if (dto.fromStartDate && !dto.toStartDate) {
      return MoreThanOrEqual(dto.fromStartDate);
    } else if (!dto.fromStartDate && dto.toStartDate) {
      return LessThanOrEqual(dto.toStartDate);
    } else if (dto.fromStartDate && dto.toStartDate) {
      return Between(dto.fromStartDate, dto.toStartDate);
    } else {
      return undefined;
    }
  }

  private parseWhereOptions(
    dto: GetVisitationDto,
  ): FindOptionsWhere<VisitationMetaModel> {
    return {
      startDate: this.parseVisitationDate(dto),
      status: dto.status && In(dto.status),
      visitationMethod: dto.visitationMethod && In(dto.visitationMethod),
      visitationType: dto.visitationType && In(dto.visitationType),
      title: dto.title && ILike(`%${dto.title}%`),
      inChargeId: dto.inChargeId,
    };
  }

  async paginateVisitations(
    church: ChurchModel,
    dto: GetVisitationDto,
  ): Promise<{ visitations: VisitationMetaModel[]; totalCount: number }> {
    const repository = this.getVisitationMetaRepository();

    const [visitations, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
          ...this.parseWhereOptions(dto),
        },
        relations: VisitationRelationOptions,
        select: VisitationSelectOptions,
        order: { [dto.order]: dto.orderDirection },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: {
          churchId: church.id,
          ...this.parseWhereOptions(dto),
        },
      }),
    ]);

    return { visitations, totalCount };
  }

  async findVisitationMetaById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getVisitationMetaRepository(qr);

    const visitation = await repository.findOne({
      where: {
        churchId: church.id,
        id: visitationMetaId,
      },
      relations: VisitationRelationOptions,
      select: VisitationSelectOptions,
    });

    if (!visitation) {
      throw new NotFoundException(VisitationException.NOT_FOUND);
    }

    return visitation;
  }

  async findVisitationMetaModelById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationMetaModel>,
  ): Promise<VisitationMetaModel> {
    const repository = this.getVisitationMetaRepository(qr);

    const metaData = await repository.findOne({
      where: {
        id: visitationMetaId,
        churchId: church.id,
      },
      relations: relationOptions,
    });

    if (!metaData) {
      throw new NotFoundException(VisitationException.NOT_FOUND);
    }

    return metaData;
  }

  async createVisitationMetaData(
    church: ChurchModel,
    dto: CreateVisitationMetaDto,
    members: MemberModel[],
    qr: QueryRunner,
  ) {
    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    return visitationMetaRepository.save({
      churchId: church.id,
      inCharge: dto.inCharge,
      members,
      creator: dto.creator,
      status: dto.status,
      visitationMethod: dto.visitationMethod,
      visitationType: dto.visitationType,
      title: dto.title,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
  }

  async updateVisitationMember(
    visitationMetaData: VisitationMetaModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<VisitationMetaModel> {
    const repository = this.getVisitationMetaRepository(qr);

    visitationMetaData.members = members;

    return repository.save(visitationMetaData);
  }

  async updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: UpdateVisitationMetaDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    const result = await visitationMetaRepository.update(
      {
        id: visitationMetaData.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException();
    }

    return result;
  }

  async deleteVisitationMeta(metaData: VisitationMetaModel, qr: QueryRunner) {
    const repository = this.getVisitationMetaRepository(qr);

    const result = await repository.softDelete(metaData.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(VisitationException.DELETE_ERROR);
    }

    return result;
  }
}
