import {
  BadRequestException,
  ForbiddenException,
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
import { GetVisitationDto } from '../../dto/request/get-visitation.dto';
import {
  VisitationListRelationOptions,
  VisitationListSelectOptions,
  VisitationRelationOptions,
  VisitationSelectOptions,
} from '../../const/visitation-find-options.const';
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import { MemberException } from '../../../members/exception/member.exception';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ManagerException } from '../../../manager/exception/manager.exception';

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
      members: dto.memberId ? { id: dto.memberId } : undefined,
    };
  }

  countAllVisitations(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getVisitationMetaRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async paginateVisitations(
    church: ChurchModel,
    dto: GetVisitationDto,
  ): Promise<VisitationMetaModel[]> {
    const repository = this.getVisitationMetaRepository();

    return repository.find({
      where: {
        churchId: church.id,
        ...this.parseWhereOptions(dto),
      },
      relations: VisitationListRelationOptions,
      select: VisitationListSelectOptions,
      order: { [dto.order]: dto.orderDirection, id: dto.orderDirection },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
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
      order: {
        members: {
          id: 'ASC',
        },
      },
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

  private assertValidCreator(creator: ChurchUserModel) {
    if (!creator.memberId) {
      throw new InternalServerErrorException(
        ManagerException.MISSING_MEMBER_DATA('심방 생성자'),
      );
    }

    if (!creator.member) {
      throw new InternalServerErrorException(MemberException.LINK_ERROR);
    }

    if (
      creator.role !== ChurchUserRole.OWNER &&
      creator.role !== ChurchUserRole.MANAGER
    ) {
      throw new ForbiddenException(VisitationException.INVALID_CREATOR);
    }
  }

  private assertValidInCharge(inCharge: ChurchUserModel) {
    if (!inCharge.memberId) {
      throw new InternalServerErrorException(
        ManagerException.MISSING_MEMBER_DATA('심방 생성자'),
      );
    }

    if (!inCharge.member) {
      throw new InternalServerErrorException(MemberException.LINK_ERROR);
    }

    if (
      inCharge.role !== ChurchUserRole.OWNER &&
      inCharge.role !== ChurchUserRole.MANAGER
    ) {
      throw new ForbiddenException(VisitationException.INVALID_IN_CHARGE);
    }
  }

  private assertValidDate(
    targetMetaData: VisitationMetaModel,
    dto: UpdateVisitationMetaDto,
  ) {
    // 심방 종료날짜만 변경하는 경우
    if (!dto.startDate && dto.endDate) {
      if (dto.endDate < targetMetaData.startDate) {
        throw new BadRequestException(VisitationException.INVALID_END_DATE);
      }
    }
    // 심방 시작날짜만 변경하는 경우
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > targetMetaData.endDate) {
        throw new BadRequestException(VisitationException.INVALID_START_DATE);
      }
    }
  }

  async createVisitationMetaData(
    church: ChurchModel,
    dto: CreateVisitationMetaDto,
    members: MemberModel[],
    qr: QueryRunner,
  ) {
    this.assertValidCreator(dto.creator);
    this.assertValidInCharge(dto.inCharge);

    const visitationMetaRepository = this.getVisitationMetaRepository(qr);

    return visitationMetaRepository.save({
      churchId: church.id,
      inCharge: dto.inCharge.member,
      members,
      creator: dto.creator.member,
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

    if (dto.inCharge) {
      this.assertValidInCharge(dto.inCharge);
    }

    this.assertValidDate(visitationMetaData, dto);

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

  async findMyVisitations(
    inCharge: MemberModel,
    from: Date,
    to: Date,
  ): Promise<VisitationMetaModel[]> {
    const repository = this.getVisitationMetaRepository();

    return repository.find({
      where: {
        inChargeId: inCharge.id,
        startDate: LessThanOrEqual(to),
        endDate: MoreThanOrEqual(from),
      },
      order: {
        endDate: 'ASC',
      },
      take: 50,
    });
  }
}
