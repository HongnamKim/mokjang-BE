import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
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
import {
  ChurchException,
  ChurchJoinRequestException,
} from './const/exception/church.exception';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN,
  IChurchJoinRequestDomainService,
} from './churches-domain/interface/church-join-requests-domain.service.interface';
import { UserException } from '../user/exception/user.exception';
import { ChurchJoinRequestStatusEnum } from './const/church-join-request-status.enum';

@Injectable()
export class ChurchesService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,
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

  async postChurchJoinRequest(
    accessPayload: JwtAccessPayload,
    churchId: number,
  ) {
    const userId = accessPayload.id;
    const user = await this.userDomainService.findUserById(userId);

    if (user.church) {
      throw new ConflictException(UserException.ALREADY_JOINED);
    }

    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.churchJoinRequestsDomainService.createChurchJoinRequest(
      church,
      user,
    );
  }

  async getChurchJoinRequests(churchId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.churchJoinRequestsDomainService.findChurchJoinRequests(church);
  }

  async acceptChurchJoinRequest(
    churchId: number,
    joinId: number,
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

    if (joinRequest.status === ChurchJoinRequestStatusEnum.APPROVED) {
      throw new BadRequestException(
        ChurchJoinRequestException.ALREADY_APPROVED,
      );
    }

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.APPROVED,
      qr,
    );

    await this.userDomainService.signInChurch(
      joinRequest.user,
      church,
      UserRole.member,
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
    if (joinRequest.status === ChurchJoinRequestStatusEnum.APPROVED) {
      throw new BadRequestException(
        ChurchJoinRequestException.ALREADY_APPROVED,
      );
    }
    if (joinRequest.status === ChurchJoinRequestStatusEnum.REJECTED) {
      throw new BadRequestException(
        ChurchJoinRequestException.ALREADY_REJECTED,
      );
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
}
