import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from './user-domain/interface/user-domain.service.interface';
import { ChurchModel } from '../churches/entity/church.entity';
import { UserRole } from './const/user-role.enum';
import { MemberModel } from '../members/entity/member.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @InjectRepository(MemberModel)
    private readonly memberRepository: Repository<MemberModel>,
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  private getMemberRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.memberRepository;
  }

  private getChurchRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchModel) : this.churchRepository;
  }

  async getUserById(id: number) {
    return this.userDomainService.findUserById(id);
  }

  async signInChurch(userId: number, churchId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserById(userId);

    if (user.adminChurch) {
      throw new BadRequestException('이미 소속된 교회가 있습니다.');
    }

    // TODO ChurchDomainService 로 변경
    const church = await this.getChurchRepository(qr).findOne({
      where: {
        id: churchId,
      },
    });

    if (!church) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }

    // 사용자 정보 업데이트
    await this.userDomainService.updateUser(
      user,
      { role: UserRole.member },
      qr,
    );

    // 사용자 - 교회 관계 설정
    await this.userDomainService.signInChurch(user, church, qr);
  }

  async linkMemberToUser(userId: number, memberId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserById(userId);

    const member = await this.getMemberRepository(qr).findOne({
      where: {
        churchId: user.adminChurch.id,
        id: memberId,
      },
    });

    if (!member) {
      throw new NotFoundException('관리 교회에 해당 교인이 존재하지 않습니다.');
    }

    if (user.mobilePhone !== member.mobilePhone) {
      throw new BadRequestException(
        '계정 정보와 교인 정보가 일치하지 않습니다.',
      );
    }

    return this.userDomainService.linkMemberToUser(member, user);
  }
}
