import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../churches-domain/interface/church-join-requests-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/service/interface/members-domain.service.interface';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { UserException } from '../../user/exception/user.exception';
import { ApproveJoinRequestDto } from '../dto/church-join-request/approve-join-request.dto';
import { QueryRunner } from 'typeorm';
import { ChurchJoinRequestStatusEnum } from '../const/church-join-request-status.enum';
import { ChurchJoinRequestException } from '../const/exception/church.exception';
import { UserRole } from '../../user/const/user-role.enum';
import { MemberException } from '../../members/const/exception/member.exception';
import {
  ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE,
  IChurchJoinRequestStatsDomainService,
} from '../churches-domain/interface/church-join-request-stats-domain.service.interface';
import { GetJoinRequestDto } from '../dto/church-join-request/get-join-request.dto';
import { JoinRequestPaginationResult } from '../dto/church-join-request/join-request-pagination-result.dto';

@Injectable()
export class ChurchJoinRequestService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,
    @Inject(ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE)
    private readonly churchJoinRequestStatsDomainService: IChurchJoinRequestStatsDomainService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  async postChurchJoinRequest(
    accessPayload: JwtAccessPayload,
    joinCode: string,
    qr: QueryRunner,
  ) {
    const userId = accessPayload.id;
    const user = await this.userDomainService.findUserById(userId);

    if (user.church) {
      throw new ConflictException(UserException.ALREADY_JOINED);
    }

    await this.churchJoinRequestStatsDomainService.increaseAttemptsCount(
      user,
      qr,
    );

    await this.churchJoinRequestsDomainService.ensureUserCanRequestJoinChurch(
      user,
      qr,
    );

    const church = await this.churchesDomainService.findChurchModelByJoinCode(
      joinCode,
      qr,
    );

    return this.churchJoinRequestsDomainService.createChurchJoinRequest(
      church,
      user,
      qr,
    );
  }

  async getChurchJoinRequests(churchId: number, dto: GetJoinRequestDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } =
      await this.churchJoinRequestsDomainService.findChurchJoinRequests(
        church,
        dto,
      );

    const result: JoinRequestPaginationResult = {
      data,
      totalCount,
      totalPage: Math.ceil(totalCount / dto.take),
      count: data.length,
      page: dto.page,
    };

    return result;
  }

  async approveChurchJoinRequest(
    churchId: number,
    joinId: number,
    dto: ApproveJoinRequestDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const joinRequest =
      await this.churchJoinRequestsDomainService.findChurchJoinRequestById(
        church,
        joinId,
        qr,
      );

    if (joinRequest.status !== ChurchJoinRequestStatusEnum.PENDING) {
      // 취소된 가입 신청일 경우
      if (joinRequest.status === ChurchJoinRequestStatusEnum.CANCELED) {
        throw new BadRequestException(
          ChurchJoinRequestException.CANCELED_REQUEST,
        );
      }
      // 이미 처리된 가입 신청
      throw new BadRequestException(ChurchJoinRequestException.ALREADY_DECIDED);
    }

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.APPROVED,
      qr,
    );

    // user - church 연결
    await this.userDomainService.signInChurch(
      joinRequest.user,
      church,
      UserRole.member,
      qr,
    );

    // user - member 연결
    const linkMember = await this.membersDomainService.findMemberModelById(
      church,
      dto.linkMemberId,
      qr,
      { user: true },
    );

    if (linkMember.user) {
      throw new ConflictException(MemberException.ALREADY_LINKED);
    }

    await this.userDomainService.linkMemberToUser(linkMember, joinRequest.user);

    return this.churchJoinRequestsDomainService.findChurchJoinRequestById(
      church,
      joinId,
      qr,
    );
  }

  async rejectChurchJoinRequest(
    churchId: number,
    joinId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const joinRequest =
      await this.churchJoinRequestsDomainService.findChurchJoinRequestById(
        church,
        joinId,
        qr,
      );

    if (joinRequest.status !== ChurchJoinRequestStatusEnum.PENDING) {
      throw new BadRequestException(ChurchJoinRequestException.ALREADY_DECIDED);
    }

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.REJECTED,
      qr,
    );

    return this.churchJoinRequestsDomainService.findChurchJoinRequestById(
      church,
      joinId,
      qr,
    );
  }

  async deleteChurchJoinRequest(
    churchId: number,
    joinId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const joinRequest =
      await this.churchJoinRequestsDomainService.findChurchJoinRequestById(
        church,
        joinId,
        qr,
      );

    if (joinRequest.status === ChurchJoinRequestStatusEnum.PENDING) {
      throw new BadRequestException(ChurchJoinRequestException.NOT_DECIDED);
    }

    await this.churchJoinRequestsDomainService.deleteChurchJoinRequest(
      joinRequest,
      qr,
    );

    return `ChurchJoinRequest id: ${joinId} deleted`;
  }

  getTopRequestUsers() {
    return this.churchJoinRequestStatsDomainService.getTopRequestUsers();
  }
}
