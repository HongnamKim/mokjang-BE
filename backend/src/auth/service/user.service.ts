import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../entity/user.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  private getUserRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
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
}
