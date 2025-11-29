import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { DeviceService } from '../service/device.service';
import { RegisterDeviceDto } from '../dto/request/register-device.dto';
import { DeleteDeviceDto } from '../dto/request/delete-device.dto';
import { RegisterDeviceResponseDto } from '../dto/response/register-device-response.dto';
import { ApiRegisterDevice } from '../swagger/device.swagger';

@Controller()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiRegisterDevice()
  @Post('register-device')
  @UseGuards(AccessTokenGuard)
  async registerDevice(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    await this.deviceService.registerDevice(accessToken.id, dto);

    return new RegisterDeviceResponseDto('ok');
  }

  @Delete('delete-device')
  @UseGuards(AccessTokenGuard)
  async deleteDevice(
    @Token(AuthType.ACCESS) accessToken: JwtAccessPayload,
    @Body() dto: DeleteDeviceDto,
  ) {
    await this.deviceService.deleteDevice(accessToken.id, dto.deviceId);

    return { timestamp: new Date(), success: true };
  }
}
