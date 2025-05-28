import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetManagersDto } from '../../../dto/request/get-managers.dto';
import { ManagerDomainPaginationResultDto } from '../../dto/manager-domain-pagination-result.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { PermissionTemplateModel } from '../../../../permission/entity/permission-template.entity';

export const IMANAGER_DOMAIN_SERVICE = Symbol('IMANAGER_DOMAIN_SERVICE');

export interface IManagerDomainService {
  findManagers(
    church: ChurchModel,
    dto: GetManagersDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto>;

  findManagerModelById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel>;

  findManagerById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<MemberModel>;

  updatePermissionActive(
    manager: MemberModel,
    activity: boolean,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  assignPermissionTemplate(
    manager: MemberModel,
    permissionTemplate: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  unassignPermissionTemplate(
    manager: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
