import { Inject, Injectable } from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  IDEVICE_DOMAIN_SERVICE,
  IDeviceDomainService,
} from '../notification-domain/interface/device-domain.service.interface';
import { RegisterDeviceDto } from '../dto/request/register-device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IDEVICE_DOMAIN_SERVICE)
    private readonly deviceDomainService: IDeviceDomainService,
  ) {}

  async registerDevice(userId: number, dto: RegisterDeviceDto) {
    const user = await this.userDomainService.findUserById(userId);

    return this.deviceDomainService.saveDeviceToken(user, dto);
  }

  async deleteDevice(userId: number, deviceId: string) {
    const user = await this.userDomainService.findUserById(userId);

    this.deviceDomainService.deleteDeviceToken(user, deviceId);
  }
}
