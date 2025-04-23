import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../entity/user.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { IUserDomainService } from '../interface/user-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRole } from '../../const/user-role.enum';
import { MemberModel } from '../../../members/entity/member.entity';
import { UserException } from '../../const/exception/user.exception';

@Injectable()
export class UserDomainService implements IUserDomainService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  private getUserRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
  }

  async findUserById(id: number, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    const user = await userRepository.findOne({
      where: {
        id,
      },
      relations: {
        church: true,
        member: true,
      },
    });

    if (!user) {
      throw new NotFoundException(UserException.NOT_FOUND);
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

  isAbleToCreateChurch(user: UserModel): boolean {
    if (user.role !== UserRole.none) {
      throw new BadRequestException(UserException.CANNOT_CREATE_CHURCH);
    }

    return true;
  }

  async signInChurch(
    user: UserModel,
    church: ChurchModel,
    role: UserRole,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const userRepository = this.getUserRepository(qr);

    return userRepository.update(
      {
        id: user.id,
      },
      {
        church: church,
        role,
      },
    );
  }

  async linkMemberToUser(
    member: MemberModel,
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<UserModel> {
    const userRepository = this.getUserRepository(qr);

    await userRepository.update(
      {
        id: user.id,
      },
      {
        member: member,
      },
    );

    const updatedUser = await userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        church: true,
        member: true,
      },
    });

    if (!updatedUser) {
      throw new InternalServerErrorException(UserException.UPDATE_ERROR);
    }

    return updatedUser;
  }

  async findMainAdminUser(
    church: ChurchModel,
    qr?: QueryRunner,
  ): Promise<UserModel> {
    const userRepository = this.getUserRepository(qr);

    const mainAdmin = await userRepository.findOne({
      where: {
        churchId: church.id,
        role: UserRole.mainAdmin,
      },
      relations: {
        member: true,
      },
    });

    if (!mainAdmin) {
      throw new NotFoundException(UserException.NOT_FOUND);
    }

    return mainAdmin;
  }

  async transferMainAdmin(
    beforeMainAdmin: UserModel,
    newMainAdmin: UserModel,
    qr: QueryRunner,
  ) {
    const userRepository = this.getUserRepository(qr);

    await Promise.all([
      userRepository.update(
        { id: beforeMainAdmin.id },
        { role: UserRole.manager },
      ),
      userRepository.update(
        { id: newMainAdmin.id },
        { role: UserRole.mainAdmin },
      ),
    ]);
  }
}
