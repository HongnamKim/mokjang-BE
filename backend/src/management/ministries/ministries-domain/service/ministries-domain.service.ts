import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistriesDomainService } from '../interface/ministries-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MinistryModel,
  MinistryModelColumns,
} from '../../entity/ministry.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetMinistryDto } from '../../dto/ministry/request/get-ministry.dto';
import { MinistryException } from '../../const/exception/ministry.exception';
import { CreateMinistryDto } from '../../dto/ministry/request/create-ministry.dto';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../../dto/ministry/request/update-ministry.dto';
import { OfficersException } from '../../../officers/const/exception/officers.exception';
import { MemberModel } from '../../../../members/entity/member.entity';

@Injectable()
export class MinistriesDomainService implements IMinistriesDomainService {
  constructor(
    @InjectRepository(MinistryModel)
    private readonly ministriesRepository: Repository<MinistryModel>,
  ) {}

  private getMinistriesRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryModel)
      : this.ministriesRepository;
  }

  private async isExistMinistry(
    churchId: number,
    ministryGroup: MinistryGroupModel | null,
    name: string,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        churchId,
        ministryGroupId: ministryGroup === null ? IsNull() : ministryGroup.id,
        name,
      },
      withDeleted: true,
    });

    // soft-deleted 된 사역일 경우 완전 삭제
    if (ministry && ministry.deletedAt) {
      await ministriesRepository.remove(ministry);

      return false;
    }

    return !!ministry;
  }

  countMinistriesInMinistryGroup(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<number> {
    const repository = this.getMinistriesRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
        ministryGroupId: ministryGroup.id,
      },
    });
  }

  async findMinistries(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const order: FindOptionsOrder<MinistryModel> = {
      [dto.order]: dto.orderDirection,
      id: dto.orderDirection,
    };

    return ministriesRepository.find({
      where: {
        churchId: church.id,
        ministryGroupId: ministryGroup.id,
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findMinistryModelById(
    //church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    ministryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryModel>,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        id: ministryId,
        //churchId: church.id,
        ministryGroupId: ministryGroup.id,
      },
      relations: relationOptions ? relationOptions : { ministryGroup: true },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;
  }

  async findMinistryById(
    church: ChurchModel,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        churchId: church.id,
        id: ministryId,
      },
      relations: {
        //members: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;
  }

  async findMinistriesByIds(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    ministryIds: number[],
    qr?: QueryRunner,
  ): Promise<MinistryModel[]> {
    const repository = this.getMinistriesRepository(qr);

    const ministries = await repository.find({
      where: {
        churchId: church.id,
        ministryGroupId: ministryGroup.id,
        id: In(ministryIds),
      },
    });

    if (ministries.length !== ministryIds.length) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministries;
  }

  async createMinistry(
    church: ChurchModel,
    dto: CreateMinistryDto,
    ministryGroup: MinistryGroupModel | null,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const isExistMinistry = await this.isExistMinistry(
      church.id,
      ministryGroup,
      dto.name,
      qr,
    );

    if (isExistMinistry) {
      throw new ConflictException(MinistryException.ALREADY_EXIST);
    }

    return ministriesRepository.save({
      name: dto.name,
      churchId: church.id,
      ministryGroup: ministryGroup ? ministryGroup : undefined,
    });
  }

  async updateMinistry(
    targetMinistry: MinistryModel,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const newName = dto.name;

    const isExist = await ministriesRepository.findOne({
      where: {
        id: targetMinistry.id,
        ministryGroupId: targetMinistry.ministryGroupId,
        name: newName,
      },
    });

    if (isExist) {
      throw new BadRequestException(MinistryException.ALREADY_EXIST);
    }

    const result = await ministriesRepository.update(
      {
        id: targetMinistry.id,
        deletedAt: IsNull(),
      },
      {
        name: newName,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return result;
  }

  async deleteMinistry(ministry: MinistryModel, qr?: QueryRunner) {
    if (ministry.membersCount !== 0) {
      throw new BadRequestException(OfficersException.HAS_DEPENDENCIES);
    }

    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.softDelete({
      id: ministry.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return;
  }

  async incrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.increment(
      { id: ministry.id, deletedAt: IsNull() },
      MinistryModelColumns.membersCount,
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    if (ministry.membersCount === 0) {
      throw new ConflictException(MinistryException.EMPTY_MEMBER_COUNT);
    }

    const result = await ministriesRepository.decrement(
      { id: ministry.id, deletedAt: IsNull() },
      MinistryModelColumns.membersCount,
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }

  async refreshMembersCount(
    ministry: MinistryModel,
    membersCount: number,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const updatedMinistry = await ministriesRepository.preload({
      id: ministry.id,
      membersCount: membersCount,
    });

    if (!updatedMinistry) {
      throw new InternalServerErrorException(MinistryException.UPDATE_ERROR);
    }

    return updatedMinistry;
  }

  async assignMemberToMinistry(
    member: MemberModel,
    oldMinistry: MinistryModel[],
    newMinistry: MinistryModel,
    qr: QueryRunner,
  ): Promise<void> {
    try {
      const memberId = member.id;

      // 기존 사역 제거
      if (oldMinistry.length > 0) {
        const oldMinistryIds = oldMinistry.map((ministry) => ministry.id);

        await qr.manager
          .createQueryBuilder()
          .relation(MinistryModel, 'members')
          .of(oldMinistryIds)
          .remove(memberId);
      }

      // 새로운 사역 등록
      await qr.manager
        .createQueryBuilder()
        .relation(MinistryModel, 'members')
        .of(newMinistry.id)
        .add(memberId);

      return;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          MinistryException.ALREADY_ASSIGNED_MINISTRY,
        );
      }
    }
  }

  async removeMemberFromMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<void> {
    await qr.manager
      .createQueryBuilder()
      .relation(MinistryModel, 'members')
      .of(ministry)
      .remove(member.id);
  }
}
