import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IVisitationMetaDomainService } from './interface/visitation-meta-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import {
  Between,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateVisitationMetaDto } from '../../dto/meta/create-visitation-meta.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { VisitationMetaException } from '../../const/exception/visitation-meta.exception';
import { UpdateVisitationMetaDto } from '../../dto/meta/update-visitation-meta.dto';
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
    if (dto.fromVisitationDate && !dto.toVisitationDate) {
      return MoreThanOrEqual(dto.fromVisitationDate);
    } else if (!dto.fromVisitationDate && dto.toVisitationDate) {
      return LessThanOrEqual(dto.toVisitationDate);
    } else if (dto.fromVisitationDate && dto.toVisitationDate) {
      return Between(dto.fromVisitationDate, dto.toVisitationDate);
    } else {
      return undefined;
    }
  }

  private parseWhereOptions(dto: GetVisitationDto) {
    return {
      visitationDate: this.parseVisitationDate(dto),
      visitationStatus:
        dto.where__visitationStatus && In(dto.where__visitationStatus),
      visitationMethod:
        dto.where__visitationMethod && In(dto.where__visitationMethod),
      visitationType:
        dto.where__visitationType && In(dto.where__visitationType),
      visitationTitle:
        dto.where__visitationTitle && ILike(`%${dto.where__visitationTitle}%`),
      instructorId: dto.where__instructorId,
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
      throw new NotFoundException(VisitationMetaException.NOT_FOUND);
    }

    return visitation;
  }

  async findVisitationMetaModelById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel> {
    const repository = this.getVisitationMetaRepository(qr);

    const metaData = await repository.findOne({
      where: {
        id: visitationMetaId,
        churchId: church.id,
      },
    });

    if (!metaData) {
      throw new NotFoundException(VisitationMetaException.NOT_FOUND);
    }

    return metaData;
  }

  async createVisitationMetaData(
    church: ChurchModel,
    instructor: MemberModel,
    dto: CreateVisitationMetaDto,
    members: MemberModel[],
    qr: QueryRunner,
    reportTo?: MemberModel,
  ) {
    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    return visitationMetaRepository.save({
      churchId: church.id,
      instructor,
      members,
      creator: dto.creator,
      visitationStatus: dto.visitationStatus,
      visitationMethod: dto.visitationMethod,
      visitationType: dto.visitationType,
      visitationTitle: dto.visitationTitle,
      visitationDate: dto.visitationDate,
      //reportTo: reportTo ? reportTo : undefined,
    });
  }

  async updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: UpdateVisitationMetaDto,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel> {
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

    const meta = await this.visitationMetaRepository.findOne({
      where: {
        id: visitationMetaData.id,
      },
    });

    if (!meta) {
      throw new InternalServerErrorException(
        VisitationMetaException.UPDATE_ERROR,
      );
    }

    return meta;
  }

  async deleteVisitationMeta(metaData: VisitationMetaModel, qr: QueryRunner) {
    const repository = this.getVisitationMetaRepository(qr);

    const result = await repository.softDelete(metaData.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        VisitationMetaException.DELETE_ERROR,
      );
    }

    return result;
  }
}
