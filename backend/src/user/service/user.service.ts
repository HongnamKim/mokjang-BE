import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user-domain/interface/user-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../../church-join/church-join-domain/interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestStatusEnum } from '../../church-join/const/church-join-request-status.enum';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,
  ) {}

  async getUserById(id: number) {
    return this.userDomainService.findUserModelById(id);
  }

  async getMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserModelById(userId, qr);

    return this.churchJoinRequestsDomainService.findMyChurchJoinRequest(
      user,
      qr,
    );
  }

  async cancelMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserModelById(userId, qr);

    const joinRequest =
      await this.churchJoinRequestsDomainService.findMyPendingChurchJoinRequest(
        user,
        qr,
      );

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.CANCELED,
      qr,
    );

    return this.churchJoinRequestsDomainService.findMyChurchJoinRequestById(
      user,
      joinRequest.id,
      qr,
    );
  }

  async getMyPendingJoinRequest(userId: number) {
    const user = await this.userDomainService.findUserModelById(userId);

    return this.churchJoinRequestsDomainService.findMyPendingChurchJoinRequest(
      user,
    );
  }
}
