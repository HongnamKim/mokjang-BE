import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TempUserModel } from '../../entity/temp-user.entity';
import { DeleteResult, LessThan, QueryRunner, Repository } from 'typeorm';
import { UpdateTempUserDto } from '../../../user/dto/update-temp-user.dto';
import { ITempUserDomainService } from './interface/temp-user.service.interface';
import { TempUserException } from '../../const/exception/auth.exception';
import { subWeeks } from 'date-fns';

@Injectable()
export class TempUserDomainService implements ITempUserDomainService {
  constructor(
    @InjectRepository(TempUserModel)
    private readonly tempUserRepository: Repository<TempUserModel>,
  ) {}

  private getTempUserRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(TempUserModel)
      : this.tempUserRepository;
  }

  findTempUserModelByOAuth(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ) {
    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  async isExistTempUser(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ) {
    const tempUserRepository = this.getTempUserRepository(qr);

    const tempUser = await tempUserRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });

    return !!tempUser;
  }

  async getTempUserById(id: number, qr?: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    const tempUser = await tempUserRepository.findOne({
      where: {
        id,
      },
    });

    if (!tempUser) {
      throw new NotFoundException(TempUserException.NOT_FOUND);
    }

    return tempUser;
  }

  async createTempUser(provider: string, providerId: string, qr?: QueryRunner) {
    const isExistTempUser = await this.isExistTempUser(provider, providerId);

    if (isExistTempUser) {
      throw new BadRequestException(TempUserException.ALREADY_EXIST);
    }

    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.save({
      provider,
      providerId,
    });
  }

  async initRequestAttempt(tempUser: TempUserModel, qr?: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.update(
      {
        id: tempUser.id,
      },
      {
        requestAttempts: 0,
      },
    );
  }

  async updateTempUser(
    tempUser: TempUserModel,
    dto: UpdateTempUserDto,
    qr: QueryRunner,
  ) {
    const tempUserRepository = this.getTempUserRepository(qr);

    await tempUserRepository.update({ id: tempUser.id }, { ...dto });

    return tempUserRepository.findOne({ where: { id: tempUser.id } });
  }

  incrementVerificationAttempts(tempUser: TempUserModel, qr?: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.increment(
      { id: tempUser.id },
      'verificationAttempts',
      1,
    );
  }

  markAsVerified(tempUser: TempUserModel, qr?: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.update({ id: tempUser.id }, { isVerified: true });
  }

  deleteTempUser(tempUser: TempUserModel, qr?: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    return tempUserRepository.delete(tempUser.id);
  }

  cleanUp(): Promise<DeleteResult> {
    const repository = this.getTempUserRepository();

    const pivotDate = subWeeks(new Date(), 1);

    return repository.delete({
      createdAt: LessThan(pivotDate),
    });
  }
}
