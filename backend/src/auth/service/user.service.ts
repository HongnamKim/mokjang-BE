import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../entity/user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/user/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  private getUserRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
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

  findUserModelByOAuth(provider: string, providerId: string, qr?: QueryRunner) {
    const userRepository = this.getUserRepository(qr);

    return userRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  async getUserModelByProvider(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ) {
    const userRepository = this.getUserRepository(qr);

    const user = await userRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  getUserById(id: number) {
    const userRepository = this.getUserRepository();

    return userRepository.findOne({
      where: {
        id,
      },
      relations: {
        adminChurch: true,
        managingChurch: true,
      },
    });
  }

  async createUser(dto: CreateUserDto, qr?: QueryRunner) {
    const isExistUser = await this.isExistUser(dto.provider, dto.providerId);

    if (isExistUser) {
      throw new BadRequestException('이미 가입 이력이 있는 소셜 계정입니다.');
    }

    const userRepository = this.getUserRepository(qr);

    return userRepository.save({
      ...dto,
    });
  }
}
