import { Inject, Injectable } from '@nestjs/common';
import { MinistryModel } from '../entity/ministry.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryDto } from '../dto/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/update-ministry.dto';
import { MinistryGroupService } from './ministry-group.service';
import { GetMinistryDto } from '../dto/get-ministry.dto';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../ministries-domain/interface/ministries-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';

@Injectable()
export class MinistryService {
  constructor(
    /*@InjectRepository(MinistryModel)
    private readonly ministryRepository: Repository<MinistryModel>,*/
    private readonly ministryGroupService: MinistryGroupService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministriesDomainService: IMinistriesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
  ) {}

  /*private getMinistryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryModel)
      : this.ministryRepository;
  }*/

  /*async isExistMinistry(
    churchId: number,
    ministryGroupId: number | null,
    name: string,
    qr?: QueryRunner /!*ministryGroupId: number*!/,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        churchId,
        ministryGroupId: ministryGroupId ? ministryGroupId : IsNull(),
        name: name,
      },
    });

    return !!ministry;
  }*/

  async getMinistries(churchId: number, dto: GetMinistryDto, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistries(church, dto, qr);

    /*const ministryRepository = this.getMinistryRepository(qr);

    return ministryRepository.find({
      where: {
        churchId,
        ministryGroupId:
          dto.ministryGroupId === 0 ? IsNull() : dto.ministryGroupId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        id: 'asc',
      },
    });*/
  }

  async getMinistryModelById(
    churchId: number,
    ministryId: number,
    relationOptions?: FindOptionsRelations<MinistryModel>,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistryModelById(
      church,
      ministryId,
      qr,
      relationOptions,
    );

    /*const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        id: ministryId,
        churchId,
      },
      relations: {
        ministryGroup: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;*/
  }

  async getMinistryById(
    churchId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistryById(
      church,
      ministryId,
      qr,
    );

    /*const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        churchId,
        id: ministryId,
      },
      relations: {
        members: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;*/
  }

  async createMinistry(
    churchId: number,
    dto: CreateMinistryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          church.id,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    return this.ministriesDomainService.createMinistry(
      church,
      dto,
      qr,
      ministryGroup,
    );

    /*const ministryRepository = this.getMinistryRepository(qr);

    const existingMinistry = await ministryRepository.findOne({
      where: {
        churchId,
        ministryGroupId: dto.ministryGroupId ? dto.ministryGroupId : IsNull(),
        name: dto.name,
      },
      relations: { members: true },
      withDeleted: true,
    });

    if (existingMinistry) {
      if (!existingMinistry.deletedAt) {
        throw new BadRequestException(MinistryException.ALREADY_EXIST);
      }

      await ministryRepository.remove(existingMinistry);
    }

    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          churchId,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    const result = await ministryRepository.insert({
      name: dto.name,
      churchId: churchId,
      ministryGroup,
    });

    return ministryRepository.findOne({
      where: {
        id: result.identifiers[0].id,
      },
      relations: {
        ministryGroup: true,
      },
    });*/
  }

  async updateMinistry(
    churchId: number,
    ministryId: number,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ) {
    /*
    이름만 변경하는 경우
      --> 현재 그룹에 변경하고자 하는 이름이 존재하는지

    그룹만 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 현재 이름이 변경하고자 하는 그룹에 존재하는지

    이름+그룹 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 변경하고자 하는 그룹에 변경하고자 하는 이름이 존재하는지
     */

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetMinistry =
      await this.ministriesDomainService.findMinistryModelById(
        church,
        ministryId,
        qr,
        {
          ministryGroup: true,
        },
      );

    const newMinistryGroup = dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          church.id,
          dto.ministryGroupId,
          qr,
        )
      : targetMinistry.ministryGroup;

    return this.ministriesDomainService.updateMinistry(
      church,
      targetMinistry,
      dto,
      qr,
      newMinistryGroup,
    );

    /*const ministryRepository = this.getMinistryRepository(qr);

    const targetMinistry = await this.getMinistryModelById(
      churchId,
      ministryId,
      {},
      qr,
    );

    // dto.ministryGroupId 가 있을 경우(number | 0) --> ministryGroup 변경 dto.ministryGroupId
    // dto.ministryGroupId 가 없을 경우(undefined) --> ministryGroup 유지 targetMinistry.ministryGroupId
    const newMinistryGroupId =
      dto.ministryGroupId === undefined
        ? targetMinistry.ministryGroupId
        : dto.ministryGroupId;

    // 그룹 변경 시 그룹이 있는지 확인
    dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          churchId,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    // 이름 중복 확인
    const name = dto.name ? dto.name : targetMinistry.name;

    const isExistMinistry = await this.isExistMinistry(
      churchId,
      newMinistryGroupId,
      name,
      qr,
    );

    if (isExistMinistry) {
      throw new BadRequestException(MinistryException.ALREADY_EXIST);
    }

    await ministryRepository.update(
      {
        id: ministryId,
        churchId,
      },
      {
        ministryGroupId: newMinistryGroupId ? newMinistryGroupId : null,
        name: dto.name,
      },
    );

    return ministryRepository.findOne({
      where: {
        id: ministryId,
        churchId,
      },
    });*/
  }

  async deleteMinistry(churchId: number, ministryId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      church,
      ministryId,
      qr,
    );

    return this.ministriesDomainService.deleteMinistry(ministry, qr);

    /*const ministryRepository = this.getMinistryRepository(qr);

    const targetMinistry = await this.getMinistryById(churchId, ministryId, qr);

    await ministryRepository.softRemove(targetMinistry);

    return `ministryId ${ministryId} deleted`;*/
  }

  /*async incrementMembersCount(
    churchId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const result = await ministryRepository.increment(
      { id: ministryId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }*/

  /*async decrementMembersCount(
    churchId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const result = await ministryRepository.decrement(
      { id: ministryId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }*/
}
