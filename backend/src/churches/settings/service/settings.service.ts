import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerModel } from '../entity/officer.entity';
import {
  EntitySchema,
  EntityTarget,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { MinistryModel } from '../entity/ministry.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { BaseChurchSettingModel } from '../entity/base-church-setting.entity';
import { SETTING_EXCEPTION } from '../exception-messages/exception-messages.const';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { EducationModel } from '../entity/education.entity';

@Injectable()
export class SettingsService {
  private entityMap: Map<string, Repository<any>>;

  constructor(
    @InjectRepository(OfficerModel)
    private readonly positionsRepository: Repository<OfficerModel>,
    @InjectRepository(MinistryModel)
    private readonly ministryRepository: Repository<MinistryModel>,
    @InjectRepository(EducationModel)
    private readonly educationRepository: Repository<EducationModel>,
    private readonly churchesService: ChurchesService,
  ) {
    this.entityMap = new Map([
      [OfficerModel.name, positionsRepository],
      [MinistryModel.name, ministryRepository],
      [EducationModel.name, educationRepository],
    ]);
  }

  private getRepository<T extends BaseChurchSettingModel>(
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    const repository = qr
      ? qr.manager.getRepository(entity)
      : this.entityMap.get(this.getEntityName(entity));

    if (!repository) {
      throw new InternalServerErrorException(
        '존재하지 않는 교회 커스텀 설정 대상입니다.',
      );
    }

    return repository;
  }

  private getEntityName<T extends BaseChurchSettingModel>(
    entity: EntityTarget<T>,
  ) {
    if (typeof entity === 'string') {
      return entity;
    } else if (entity instanceof EntitySchema) {
      return entity.options.name;
    } else if ('name' in entity) {
      return entity.name;
    } else {
      throw new InternalServerErrorException('Invalid Entity Target');
    }
  }

  private async checkChurchExist(churchId: number) {
    const isExistChurch = await this.churchesService.isExistChurch(churchId);

    if (!isExistChurch) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }
  }

  private async isExistSettingValue<T extends BaseChurchSettingModel>(
    churchId: number,
    name: string,
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(entity, qr);

    const position = await repository.findOne({
      where: {
        churchId,
        name,
      },
    });

    return !!position;
  }

  async getSettingValues<T extends BaseChurchSettingModel>(
    churchId: number,
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const repository = this.getRepository(entity, qr);

    return repository.find({ where: { churchId: churchId } });
  }

  async postSettingValues<T extends BaseChurchSettingModel>(
    churchId: number,
    dto: CreateSettingDto,
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const entityName = this.getEntityName(entity);

    if (await this.isExistSettingValue(churchId, dto.name, entity, qr)) {
      throw new BadRequestException(
        SETTING_EXCEPTION[entityName].ALREADY_EXIST,
      );
    }

    const repository = this.getRepository(entity, qr);

    return repository.save({ name: dto.name, churchId });
  }

  async updateSettingValue<T extends BaseChurchSettingModel>(
    churchId: number,
    settingValueId: number,
    dto: UpdateSettingDto,
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const entityName = this.getEntityName(entity);

    if (await this.isExistSettingValue(churchId, dto.name, entity, qr)) {
      throw new BadRequestException(
        SETTING_EXCEPTION[entityName].ALREADY_EXIST,
      );
    }

    const repository = this.getRepository(entity, qr);

    const result = await repository.update(
      { id: settingValueId, deletedAt: IsNull() },
      { name: dto.name },
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION[entityName].NOT_FOUND);
    }

    return repository.findOne({ where: { id: settingValueId } });
  }

  async deleteSettingValue<T extends BaseChurchSettingModel>(
    churchId: number,
    settingValueId: number,
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const entityName = this.getEntityName(entity);

    const repository = this.getRepository(entity, qr);

    const result = await repository.softDelete({
      id: settingValueId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION[entityName].NOT_FOUND);
    }

    return 'ok';
  }

  async incrementMembersCount<T extends BaseChurchSettingModel>(
    churchId: number,
    settingValueId: number,
    entity: EntityTarget<T>,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(entity, qr);

    const result = await repository.increment(
      { id: settingValueId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    return true;
  }

  async decrementMembersCount<T extends BaseChurchSettingModel>(
    churchId: number,
    settingValueId: number,
    entity: EntityTarget<T>,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(entity, qr);

    const result = await repository.decrement(
      { id: settingValueId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    return true;
  }
}
