import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionDomainService } from './interface/permission-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionUnitModel } from '../../entity/permission-unit.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { DomainType } from '../../const/domain-type.enum';
import {
  PermissionTemplateColumns,
  PermissionTemplateModel,
} from '../../entity/permission-template.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetPermissionTemplateDto } from '../../dto/template/request/get-permission-template.dto';
import { PermissionTemplateOrder } from '../../const/permission-template-order.enum';
import { PermissionTemplateDomainPaginationResultDto } from '../dto/permission-template-domain-pagination-result.dto';
import { CreatePermissionTemplateDto } from '../../dto/template/request/create-permission-template.dto';
import { UpdatePermissionTemplateDto } from '../../dto/template/request/update-permission-template.dto';
import { PermissionException } from '../../exception/permission.exception';
import { MAX_PERMISSION_TEMPLATE_COUNT } from '../../constraints/permission.constraints';

@Injectable()
export class PermissionDomainService implements IPermissionDomainService {
  constructor(
    @InjectRepository(PermissionUnitModel)
    private readonly permissionUnitRepository: Repository<PermissionUnitModel>,
    @InjectRepository(PermissionTemplateModel)
    private readonly permissionTemplateRepository: Repository<PermissionTemplateModel>,
  ) {}

  private getUnitRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(PermissionUnitModel)
      : this.permissionUnitRepository;
  }

  private getTemplateRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(PermissionTemplateModel)
      : this.permissionTemplateRepository;
  }

  findPermissionUnits(domain?: DomainType): Promise<PermissionUnitModel[]> {
    const repository = this.getUnitRepository();

    return repository.find({
      where: {
        domain,
      },
    });
  }

  async findPermissionTemplates(
    church: ChurchModel,
    dto: GetPermissionTemplateDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getTemplateRepository(qr);

    const order: FindOptionsOrder<PermissionTemplateModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== PermissionTemplateOrder.CREATEDAT) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: {
          churchId: church.id,
        },
      }),
    ]);

    return new PermissionTemplateDomainPaginationResultDto(data, totalCount);
  }

  private async assertValidTemplateTitle(
    church: ChurchModel,
    title: string,
    qr?: QueryRunner,
  ): Promise<boolean> {
    const templateRepository = this.getTemplateRepository(qr);

    const isExist = await templateRepository.findOne({
      where: {
        churchId: church.id,
        title,
      },
    });

    if (isExist) {
      throw new ConflictException(PermissionException.ALREADY_EXIST);
    }

    return true;
  }

  private async findPermissionUnitsById(
    permissionUnitIds: number[],
    qr?: QueryRunner,
  ): Promise<PermissionUnitModel[]> {
    const unitRepository = this.getUnitRepository(qr);

    const units = await unitRepository.find({
      where: {
        id: In(permissionUnitIds),
      },
    });

    if (units.length !== permissionUnitIds.length) {
      const foundIds = units.map((u) => u.id);
      const missingIds = permissionUnitIds.filter(
        (id) => !foundIds.includes(id),
      );

      throw new NotFoundException(
        PermissionException.NOT_EXIST_PERMISSION_UNITS(missingIds),
      );
    }

    return units;
  }

  private async assertCanCreatePermissionTemplate(
    church: ChurchModel,
    qr?: QueryRunner,
  ) {
    const templateRepository = this.getTemplateRepository(qr);

    const templateCount = await templateRepository.count({
      where: { churchId: church.id },
    });

    if (templateCount > MAX_PERMISSION_TEMPLATE_COUNT) {
      throw new BadRequestException(
        PermissionException.EXCEED_MAX_PERMISSION_TEMPLATE_COUNT,
      );
    }
  }

  async createPermissionTemplate(
    church: ChurchModel,
    dto: CreatePermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<PermissionTemplateModel> {
    await this.assertCanCreatePermissionTemplate(church, qr);

    const templateRepository = this.getTemplateRepository(qr);

    // 권한 유형 이름 검증
    await this.assertValidTemplateTitle(church, dto.title, qr);

    const units = await this.findPermissionUnitsById(dto.unitIds, qr);

    return templateRepository.save({
      churchId: church.id,
      title: dto.title,
      description: dto.description,
      permissionUnits: units,
    });
  }

  async findPermissionTemplateById(
    church: ChurchModel,
    templateId: number,
    qr?: QueryRunner,
  ): Promise<PermissionTemplateModel> {
    const templateRepository = this.getTemplateRepository(qr);

    const template = await templateRepository.findOne({
      where: {
        churchId: church.id,
        id: templateId,
      },
      relations: {
        permissionUnits: true,
      },
    });

    if (!template) {
      throw new NotFoundException(PermissionException.NOT_FOUND);
    }

    return template;
  }

  async findPermissionTemplateModelById(
    church: ChurchModel,
    templateId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<PermissionTemplateModel>,
  ): Promise<PermissionTemplateModel> {
    const templateRepository = this.getTemplateRepository(qr);

    const template = await templateRepository.findOne({
      where: {
        churchId: church.id,
        id: templateId,
      },
      relations: relationOptions,
    });

    if (!template) {
      throw new NotFoundException(PermissionException.NOT_FOUND);
    }

    return template;
  }

  async updatePermissionTemplate(
    church: ChurchModel,
    template: PermissionTemplateModel,
    dto: UpdatePermissionTemplateDto,
    qr?: QueryRunner,
  ) {
    const units = dto.unitIds
      ? await this.findPermissionUnitsById(dto.unitIds, qr)
      : undefined;

    if (dto.title) {
      await this.assertValidTemplateTitle(church, dto.title, qr);
    }

    const templateRepository = this.getTemplateRepository(qr);

    const update = templateRepository.create({
      ...template,
      title: dto.title,
      permissionUnits: units,
      description: dto.description,
    });

    await templateRepository.save(update);

    return;
  }

  async deletePermissionTemplate(
    template: PermissionTemplateModel,
    qr?: QueryRunner,
  ) {
    if (template.memberCount > 0) {
      throw new ConflictException(PermissionException.CANNOT_DELETE);
    }

    const templateRepository = this.getTemplateRepository(qr);

    const result = await templateRepository.softDelete(template.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(PermissionException.DELETE_ERROR);
    }

    return result;
  }

  async incrementMemberCount(
    template: PermissionTemplateModel,
    qr: QueryRunner,
  ) {
    const templateRepository = this.getTemplateRepository(qr);

    const result = await templateRepository.increment(
      { id: template.id },
      PermissionTemplateColumns.memberCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(PermissionException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementMemberCount(
    template: PermissionTemplateModel,
    qr: QueryRunner,
  ) {
    const templateRepository = this.getTemplateRepository(qr);

    const result = await templateRepository.decrement(
      { id: template.id },
      PermissionTemplateColumns.memberCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(PermissionException.UPDATE_ERROR);
    }

    return result;
  }
}
