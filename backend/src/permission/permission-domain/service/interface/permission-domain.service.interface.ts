import { PermissionUnitModel } from '../../../entity/permission-unit.entity';
import { DomainType } from '../../../const/domain-type.enum';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetPermissionTemplateDto } from '../../../dto/template/request/get-permission-template.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { PermissionTemplateDomainPaginationResultDto } from '../../dto/permission-template-domain-pagination-result.dto';
import { CreatePermissionTemplateDto } from '../../../dto/template/request/create-permission-template.dto';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';
import { UpdatePermissionTemplateDto } from '../../../dto/template/request/update-permission-template.dto';

export const IPERMISSION_DOMAIN_SERVICE = Symbol('IPERMISSION_DOMAIN_SERVICE');

export interface IPermissionDomainService {
  findPermissionUnits(domain?: DomainType): Promise<PermissionUnitModel[]>;

  findPermissionTemplates(
    church: ChurchModel,
    dto: GetPermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<PermissionTemplateDomainPaginationResultDto>;

  createPermissionTemplate(
    church: ChurchModel,
    dto: CreatePermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<PermissionTemplateModel>;

  findPermissionTemplateById(
    church: ChurchModel,
    templateId: number,
    qr?: QueryRunner,
  ): Promise<PermissionTemplateModel>;

  findPermissionTemplateModelById(
    church: ChurchModel,
    templateId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<PermissionTemplateModel>,
  ): Promise<PermissionTemplateModel>;

  updatePermissionTemplate(
    church: ChurchModel,
    template: PermissionTemplateModel,
    dto: UpdatePermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<void>;

  deletePermissionTemplate(
    template: PermissionTemplateModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  incrementMemberCount(
    template: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementMemberCount(
    template: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
