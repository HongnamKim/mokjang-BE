import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../entity/user.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUserDomainService } from './interface/user-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../const/user-role.enum';
import { MemberModel } from '../../members/entity/member.entity';

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
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  async getMemberIdByUserId(id: number, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    const user = await userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user.memberId;
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
      throw new BadRequestException('이미 가입된 계정입니다.');
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
      throw new BadRequestException(
        '소속된 교회가 있을 경우, 교회를 생성할 수 없습니다.',
      );
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
  ): Promise<UserModel> {
    const userRepository = this.getUserRepository();

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
      throw new InternalServerErrorException('교인 연결 중 에러 발생');
    }

    return updatedUser;
  }
}
