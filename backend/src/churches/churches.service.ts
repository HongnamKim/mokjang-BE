import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateChurchDto } from './dto/create-church.dto';
import { JwtAccessPayload } from '../auth/type/jwt';
import { UpdateChurchDto } from './dto/update-church.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from './churches-domain/interface/churches-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user/user-domain/interface/user-domain.service.interface';
import { UserRole } from '../user/const/user-role.enum';
import { ChurchException } from './const/exception/church.exception';

@Injectable()
export class ChurchesService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  findAllChurches() {
    return this.churchesDomainService.findAllChurches();
  }

  async getChurchById(id: number, qr?: QueryRunner) {
    return this.churchesDomainService.findChurchById(id, qr);
  }

  async createChurch(
    accessPayload: JwtAccessPayload,
    dto: CreateChurchDto,
    qr: QueryRunner,
  ) {
    const user = await this.userDomainService.findUserById(
      accessPayload.id,
      qr,
    );

    if (user.role !== UserRole.none) {
      throw new ForbiddenException(ChurchException.NOT_ALLOWED_TO_CREATE);
    }

    const newChurch = await this.churchesDomainService.createChurch(dto, qr);

    await this.userDomainService.signInChurch(
      user,
      newChurch,
      UserRole.mainAdmin,
      qr,
    );

    return newChurch;
  }

  async updateChurch(churchId: number, dto: UpdateChurchDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.churchesDomainService.updateChurch(church, dto);
  }

  async deleteChurchById(id: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(id, qr);

    return this.churchesDomainService.deleteChurch(church, qr);
  }
}
