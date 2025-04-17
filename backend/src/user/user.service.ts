import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from './user-domain/interface/user-domain.service.interface';
import { UserRole } from './const/user-role.enum';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../members/member-domain/service/interface/members-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../churches/churches-domain/interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestStatusEnum } from '../churches/const/church-join-request-status.enum';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  async getUserById(id: number) {
    return this.userDomainService.findUserById(id);
  }

  async signInChurch(userId: number, churchId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserById(userId);

    if (user.church) {
      throw new BadRequestException('이미 소속된 교회가 있습니다.');
    }

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    // 사용자 - 교회 관계 설정
    await this.userDomainService.signInChurch(
      user,
      church,
      UserRole.member,
      qr,
    );

    return this.userDomainService.findUserById(userId, qr);
  }

  async linkMemberToUser(
    userId: number,
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const user = await this.userDomainService.findUserById(userId);

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    /*const member = await this.getMemberRepository(qr).findOne({
      where: {
        churchId: user.church.id,
        id: memberId,
      },
    });

    if (!member) {
      throw new NotFoundException('관리 교회에 해당 교인이 존재하지 않습니다.');
    }*/

    if (user.mobilePhone !== member.mobilePhone) {
      throw new BadRequestException(
        '계정 정보와 교인 정보가 일치하지 않습니다.',
      );
    }

    return this.userDomainService.linkMemberToUser(member, user);
  }

  async getMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserById(userId, qr);

    return this.churchJoinRequestsDomainService.findMyChurchJoinRequest(
      user,
      qr,
    );
  }

  async cancelMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserById(userId, qr);

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
}
