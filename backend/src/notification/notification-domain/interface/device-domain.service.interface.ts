import { DeviceModel } from '../../entity/device.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner } from 'typeorm';
import { RegisterDeviceDto } from '../../dto/request/register-device.dto';

export const IDEVICE_DOMAIN_SERVICE = Symbol('IDEVICE_DOMAIN_SERVICE');

export interface IDeviceDomainService {
  saveDeviceToken(
    user: UserModel,
    dto: RegisterDeviceDto,
  ): Promise<DeviceModel>;

  deleteDeviceToken(user: UserModel, deviceId: string, qr?: QueryRunner): void;

  activateDeviceToken(
    user: UserModel,
    deviceId: string,
    qr?: QueryRunner,
  ): Promise<void>;

  deactivateDeviceToken(
    user: UserModel,
    deviceId: string,
    qr?: QueryRunner,
  ): Promise<void>;
}
