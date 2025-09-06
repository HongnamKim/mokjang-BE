import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../church-join-domain/interface/church-join-requests-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { UserException } from '../../user/const/exception/user.exception';
import { ApproveJoinRequestDto } from '../dto/request/approve-join-request.dto';
import { QueryRunner } from 'typeorm';
import { ChurchJoinRequestStatusEnum } from '../const/church-join-request-status.enum';
import { UserRole } from '../../user/const/user-role.enum';
import {
  ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE,
  IChurchJoinRequestStatsDomainService,
} from '../church-join-domain/interface/church-join-request-stats-domain.service.interface';
import { GetJoinRequestDto } from '../dto/request/get-join-request.dto';
import { JoinRequestPaginationResult } from '../dto/response/join-request-pagination-result.dto';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../../church-user/church-user-domain/service/interface/church-user-domain.service.interface';
import { GetRecommendLinkMemberDto } from '../../members/dto/request/get-recommend-link-member.dto';
import { GetRecommendLinkMemberResponseDto } from '../dto/response/get-recommend-link-member-response.dto';
import { ChurchJoinException } from '../exception/church-join.exception';
import { PostJoinRequestResponseDto } from '../dto/response/post-join-request-response.dto';
import { MemberException } from '../../members/exception/member.exception';

@Injectable()
export class ChurchJoinService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,
    @Inject(ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE)
    private readonly churchJoinRequestStatsDomainService: IChurchJoinRequestStatsDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,

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
    const user = await this.userDomainService.findUserModelById(userId, qr);

    /**
     * ChurchUserModel 조회로 소속된 교회가 있는지 확인
     */
    if (user.role !== UserRole.NONE) {
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

    const newRequest =
      await this.churchJoinRequestsDomainService.createChurchJoinRequest(
        church,
        user,
        qr,
      );

    return new PostJoinRequestResponseDto(newRequest);
  }

  async getChurchJoinRequests(churchId: number, dto: GetJoinRequestDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } =
      await this.churchJoinRequestsDomainService.findChurchJoinRequests(
        church,
        dto,
      );

    return new JoinRequestPaginationResult(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
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
        throw new BadRequestException(ChurchJoinException.CANCELED_REQUEST);
      }
      // 이미 처리된 가입 신청
      throw new BadRequestException(ChurchJoinException.ALREADY_DECIDED);
    }

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.APPROVED,
      qr,
    );

    const linkMember = await this.membersDomainService.findMemberModelById(
      church,
      dto.linkMemberId,
      qr,
      { churchUser: true },
    );

    if (linkMember.churchUser) {
      throw new ConflictException(MemberException.ALREADY_LINKED);
    }

    await this.churchUserDomainService.createChurchUser(
      church,
      joinRequest.user,
      linkMember,
      dto.userRole,
      qr,
    );

    await this.userDomainService.updateUserRole(
      joinRequest.user,
      { role: UserRole.MANAGER },
      qr,
    );

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
      throw new BadRequestException(ChurchJoinException.ALREADY_DECIDED);
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
      throw new BadRequestException(ChurchJoinException.NOT_DECIDED);
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

  async getRecommendLinkMember(
    churchId: number,
    dto: GetRecommendLinkMemberDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const members = await this.membersDomainService.findRecommendLinkMember(
      church,
      dto,
    );

    return new GetRecommendLinkMemberResponseDto(members);
  }
}
