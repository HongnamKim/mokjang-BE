import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateChurchDto } from '../dto/create-church.dto';
import { JwtAccessPayload } from '../../auth/type/jwt';
import { UpdateChurchDto } from '../dto/update-church.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { UserRole } from '../../user/const/user-role.enum';
import { ChurchException } from '../const/exception/church.exception';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { TransferMainAdminDto } from '../dto/transfer-main-admin.dto';

@Injectable()
export class ChurchesService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  findAllChurches() {
    return this.churchesDomainService.findAllChurches();
  }

  async getChurchById(id: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchById(id, qr);

    /*const mainAdmin = await this.userDomainService.findMainAdminUser(
      church,
      qr,
    );*/

    return {
      ...church,
      //mainAdmin,
    };
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

    const mainAdminMember = await this.membersDomainService.createMember(
      newChurch,
      { name: user.name, mobilePhone: user.mobilePhone },
      qr,
    );

    await this.userDomainService.linkMemberToUser(mainAdminMember, user, qr);

    return newChurch;
  }

  async updateChurch(churchId: number, dto: UpdateChurchDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.churchesDomainService.updateChurch(church, dto);
  }

  async updateChurchJoinCode(
    churchId: number,
    newCode: string,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    await this.churchesDomainService.updateChurchJoinCode(church, newCode, qr);

    return this.churchesDomainService.findChurchModelById(churchId, qr);
  }

  async deleteChurchById(id: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(id, qr);

    return this.churchesDomainService.deleteChurch(church, qr);
  }

  async transferMainAdmin(
    churchId: number,
    mainAdminUserId: number,
    dto: TransferMainAdminDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const mainAdminMember =
      await this.membersDomainService.findMemberModelByUserId(
        church,
        mainAdminUserId,
        qr,
        { user: true },
      );

    const newMainAdminMember =
      await this.membersDomainService.findMemberModelById(
        church,
        dto.newMainAdminMemberId,
        qr,
        { user: true },
      );

    if (mainAdminMember.id === newMainAdminMember.id) {
      throw new BadRequestException(ChurchException.SAME_MAIN_ADMIN);
    }

    if (newMainAdminMember.user.role !== UserRole.manager) {
      throw new BadRequestException(ChurchException.INVALID_NEW_MAIN_ADMIN);
    }

    await this.userDomainService.transferMainAdmin(
      mainAdminMember.user,
      newMainAdminMember.user,
      qr,
    );

    return this.churchesDomainService.findChurchById(churchId, qr);
  }
}
