import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetManagersDto } from '../../../dto/request/get-managers.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { PermissionTemplateModel } from '../../../../permission/entity/permission-template.entity';
import { ManagerDomainPaginationResultDto } from '../../dto/manager-domain-pagination-result.dto';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';

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
    relationOptions?: FindOptionsRelations<ChurchUserModel>,
  ): Promise<ChurchUserModel>;

  findManagerByUserId(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findManagerById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findManagersByIds(
    church: ChurchModel,
    managerIds: number[],
    qr?: QueryRunner,
  ): Promise<ChurchUserModel[]>;

  updatePermissionActive(
    churchUser: ChurchUserModel,
    activity: boolean,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  assignPermissionTemplate(
    churchUser: ChurchUserModel,
    permissionTemplate: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  unassignPermissionTemplate(
    churchUser: ChurchUserModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
