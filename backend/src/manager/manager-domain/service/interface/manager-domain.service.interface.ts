import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetManagersDto } from '../../../dto/request/get-managers.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { PermissionTemplateModel } from '../../../../permission/entity/permission-template.entity';
import { ManagerDomainPaginationResultDto } from '../../dto/manager-domain-pagination-result.dto';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { GetManagersByPermissionTemplateDto } from '../../../../permission/dto/template/request/get-managers-by-permission-template.dto';

export const IMANAGER_DOMAIN_SERVICE = Symbol('IMANAGER_DOMAIN_SERVICE');

export interface IManagerDomainService {
  findManagers(
    church: ChurchModel,
    dto: GetManagersDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto>;

  findManagersByPermissionTemplate(
    church: ChurchModel,
    permissionTemplate: PermissionTemplateModel,
    dto: GetManagersByPermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto>;

  findManagerById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findManagerModelById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchUserModel>,
  ): Promise<ChurchUserModel>;

  /**
   * 생성자의 권한 확인용
   * @param church
   * @param userId
   * @param qr
   */
  findManagerByUserId(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findManagerForPermissionCheck(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  /**
   * inCharge 로 지정된 교인의 권한 확인용
   * @param church
   * @param managerId
   * @param qr
   */
  findManagerByMemberId(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findManagerModelByMemberId(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchUserModel>,
  ): Promise<ChurchUserModel>;

  findManagersForNotification(
    church: ChurchModel,
    memberIds: number[],
    qr?: QueryRunner,
  ): Promise<ChurchUserModel[]>;

  findManagerForNotification(
    church: ChurchModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel | null>;

  findAllManagerIds(
    church: ChurchModel,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel[]>;

  /**
   * receiver 로 지정된 교인의 권한 확인용
   * @param church
   * @param memberIds
   * @param qr
   */
  findManagersByMemberIds(
    church: ChurchModel,
    memberIds: number[],
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
