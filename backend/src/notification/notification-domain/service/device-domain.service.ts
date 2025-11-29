import { Injectable } from '@nestjs/common';
import { IDeviceDomainService } from '../interface/device-domain.service.interface';
import { DeviceModel } from '../../entity/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { RegisterDeviceDto } from '../../dto/request/register-device.dto';

@Injectable()
export class DeviceDomainService implements IDeviceDomainService {
  constructor(
    @InjectRepository(DeviceModel)
    private readonly repository: Repository<DeviceModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(DeviceModel) : this.repository;
  }

  saveDeviceToken(user: UserModel, dto: RegisterDeviceDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.save({
      userId: user.id,
      token: dto.token,
      deviceId: dto.deviceId,
      platform: dto.platform,
      isActive: true,
    });
  }

  async deleteDeviceToken(user: UserModel, deviceId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.softDelete({
      userId: user.id,
      deviceId,
    });
  }

  async activateDeviceToken(
    user: UserModel,
    deviceId: string,
    qr?: QueryRunner,
  ): Promise<void> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        userId: user.id,
        deviceId,
      },
      {
        isActive: true,
      },
    );
  }

  async deactivateDeviceToken(
    user: UserModel,
    deviceId: string,
    qr?: QueryRunner,
  ): Promise<void> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        userId: user.id,
        deviceId,
      },
      {
        isActive: false,
      },
    );
  }
}
