import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IPermissionScopeDomainService } from './interface/permission-scope-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionScopeModel } from '../../entity/permission-scope.entity';
import {
  FindOptionsRelations,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { PermissionScopeException } from '../../exception/permission-scope.exception';

@Injectable()
export class PermissionScopeDomainService
  implements IPermissionScopeDomainService
{
  constructor(
    @InjectRepository(PermissionScopeModel)
    private readonly permissionScopeRepository: Repository<PermissionScopeModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(PermissionScopeModel)
      : this.permissionScopeRepository;
  }

  async findPermissionScopeByChurchUserId(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<PermissionScopeModel>,
  ) {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchUserId: churchUser.id,
      },
      relations: relationOptions,
    });
  }

  async createAllGroupPermissionScope(
    churchUser: ChurchUserModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      churchUserId: churchUser.id,
      isAllGroups: true,
    });
  }

  async createPermissionScope(
    churchUser: ChurchUserModel,
    groups: GroupModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const permissionScopes = this.permissionScopeRepository.create(
      groups.map((group) => ({
        churchUserId: churchUser.id,
        groupId: group.id,
        isAllGroups: false,
      })),
    );

    return repository.save(permissionScopes);
  }

  async deletePermissionScope(
    toRemove: PermissionScopeModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(toRemove.map((t) => t.id));

    if (result.affected !== toRemove.length) {
      throw new InternalServerErrorException(
        PermissionScopeException.DELETE_ERROR,
      );
    }

    return result;
  }

  async applyPermissionScopeChange(
    churchUser: ChurchUserModel,
    toCreate: GroupModel[],
    toRemove: PermissionScopeModel[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    if (toRemove && toRemove.length > 0) {
      await repository.softRemove(toRemove);
    }

    const newScopes = toCreate.map((group) =>
      repository.create({
        churchUserId: churchUser.id,
        isAllGroups: false,
        groupId: group.id,
      }),
    );

    if (newScopes.length > 0) {
      await repository.save(newScopes);
    }
  }
}
