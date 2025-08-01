import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../entity/user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { IUserDomainService } from '../interface/user-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRole } from '../../const/user-role.enum';
import { UserException } from '../../const/exception/user.exception';
import {
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedSelectQB,
} from '../../../members/const/member-find-options.const';

@Injectable()
export class UserDomainService implements IUserDomainService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  private getUserRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
  }

  async findUserModelById(id: number, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    const user = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.churchUser',
        'churchUser',
        'churchUser.leftAt IS NULL',
      )
      .where('user.id = :id', { id: id })
      .getOne();

    if (!user) {
      throw new NotFoundException(UserException.NOT_FOUND);
    }

    return user;
  }

  async findUserById(userId: number, qr?: QueryRunner) {
    const repository = this.getUserRepository(qr);

    const user = await repository
      .createQueryBuilder('user')
      .leftJoin('user.churchUser', 'churchUser', 'churchUser.leftAt IS NULL')
      .addSelect([
        'churchUser.id',
        'churchUser.createdAt',
        'churchUser.updatedAt',
        'churchUser.churchId',
        'churchUser.memberId',
        'churchUser.role',
        'churchUser.joinedAt',
        'churchUser.leftAt',
      ])
      .leftJoin('churchUser.church', 'church') // 교회
      .addSelect([
        'church.id',
        'church.createdAt',
        'church.updatedAt',
        'church.name',
        'church.phone',
        'church.denomination',
        'church.address',
        'church.detailAddress',
      ])
      .leftJoin('churchUser.member', 'member') // 교인
      .addSelect(
        MemberSummarizedSelectQB /*['member.id', 'member.name', 'member.profileImageUrl']*/,
      )
      .leftJoin('member.group', 'group') // 교인 - 그룹
      .addSelect(MemberSummarizedGroupSelectQB /*['group.id', 'group.name']*/)
      .leftJoin('member.officer', 'officer') // 교인 - 직분
      .addSelect(
        MemberSummarizedOfficerSelectQB /*['officer.id', 'officer.name']*/,
      )
      //.leftJoin('member.groupRole', 'groupRole') // 교인 - 그룹 역할
      //.addSelect(['groupRole.id', 'groupRole.role'])
      .leftJoin('churchUser.permissionTemplate', 'permissionTemplate') // 관리자 - 권한 유형
      .addSelect(['permissionTemplate.id', 'permissionTemplate.title'])
      .leftJoinAndSelect(
        'permissionTemplate.permissionUnits',
        'permissionUnits',
      ) // 관리자 - 권한 유형 - 권한 단위
      .leftJoin('churchUser.permissionScopes', 'permissionScopes') // 관리자 - 권한 범위
      .addSelect(['permissionScopes.id', 'permissionScopes.isAllGroups'])
      .leftJoin('permissionScopes.group', 'permissionScopeGroup') // 관리자 - 권한 범위 - 그룹
      .addSelect(['permissionScopeGroup.id', 'permissionScopeGroup.name'])
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('유저 정보 없음');
    }

    return user;
  }

  findUserModelByOAuth(provider: string, providerId: string, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    return userRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  async isExistUser(provider: string, providerId: string, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    const user = await userRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });

    return !!user;
  }

  async createUser(dto: CreateUserDto, qr?: QueryRunner): Promise<UserModel> {
    const isExistUser = await this.isExistUser(dto.provider, dto.providerId);

    if (isExistUser) {
      throw new BadRequestException(UserException.ALREADY_EXIST);
    }

    const userRepository = this.getUserRepository(qr);

    return userRepository.save({
      ...dto,
    });
  }

  async updateUser(user: UserModel, dto: UpdateUserDto, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    return userRepository.update(
      {
        id: user.id,
      },
      {
        ...dto,
      },
    );
  }

  async findMainAdminUser(
    church: ChurchModel,
    qr?: QueryRunner,
  ): Promise<UserModel> {
    const userRepository = this.getUserRepository(qr);

    const mainAdmin = await userRepository.findOne({
      where: {
        ownedChurch: { id: church.id },
        role: UserRole.OWNER,
      },
    });

    if (!mainAdmin) {
      throw new NotFoundException(UserException.NOT_FOUND);
    }

    return mainAdmin;
  }

  async transferOwner(
    beforeMainAdmin: UserModel,
    newMainAdmin: UserModel,
    qr: QueryRunner,
  ) {
    const userRepository = this.getUserRepository(qr);

    await Promise.all([
      userRepository.update(
        { id: beforeMainAdmin.id },
        { role: UserRole.MANAGER },
      ),
      userRepository.update({ id: newMainAdmin.id }, { role: UserRole.OWNER }),
    ]);
  }
}
