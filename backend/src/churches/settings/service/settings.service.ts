import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionModel } from '../entity/position.entity';
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
import { SETTING_EXCEPTION } from '../const/exception-messages.const';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { EducationModel } from '../entity/education.entity';
import { GroupModel } from '../entity/group.entity';

@Injectable()
export class SettingsService {
  private entityMap: Map<string, Repository<any>>;

  constructor(
    @InjectRepository(PositionModel)
    private readonly positionsRepository: Repository<PositionModel>,
    @InjectRepository(MinistryModel)
    private readonly ministryRepository: Repository<MinistryModel>,
    @InjectRepository(EducationModel)
    private readonly educationRepository: Repository<EducationModel>,
    @InjectRepository(GroupModel)
    private readonly groupRepository: Repository<GroupModel>,
    private readonly churchesService: ChurchesService,
  ) {
    this.entityMap = new Map([
      [PositionModel.name, positionsRepository],
      [MinistryModel.name, ministryRepository],
      [EducationModel.name, educationRepository],
      [GroupModel.name, groupRepository],
    ]);
  }

  private getRepository<T extends BaseChurchSettingModel>(
    entity: EntityTarget<T>,
    qr?: QueryRunner,
  ) {
    return qr
      ? qr.manager.getRepository(entity)
      : this.entityMap.get(this.getEntityName(entity));
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

    if (await this.isExistSettingValue(churchId, dto.name, entity, qr)) {
      throw new BadRequestException(SETTING_EXCEPTION.POSITION.ALREADY_EXIST);
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

    if (await this.isExistSettingValue(churchId, dto.name, entity, qr)) {
      throw new BadRequestException(SETTING_EXCEPTION.POSITION.ALREADY_EXIST);
    }

    const repository = this.getRepository(entity, qr);

    const result = await repository.update(
      { id: settingValueId },
      { name: dto.name },
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.POSITION.NOT_FOUND);
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

    const repository = this.getRepository(entity, qr);

    const result = await repository.softDelete({
      id: settingValueId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.POSITION.NOT_FOUND);
    }

    return 'ok';
  }
}
