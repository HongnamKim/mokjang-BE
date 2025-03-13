import { Inject, Injectable } from '@nestjs/common';
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
    accessToken: JwtAccessPayload,
    dto: CreateChurchDto,
    qr?: QueryRunner,
  ) {
    const user = await this.userDomainService.findUserById(accessToken.id, qr);

    this.userDomainService.isAbleToCreateChurch(user);

    return this.churchesDomainService.createChurch(user, dto, qr);
  }

  async updateChurch(churchId: number, dto: UpdateChurchDto) {
    return this.churchesDomainService.updateChurch(churchId, dto);
  }

  async deleteChurchById(id: number, qr?: QueryRunner) {
    return this.churchesDomainService.deleteChurchById(id, qr);
  }
}
