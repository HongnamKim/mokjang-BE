import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../entity/member.entity';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { GetMemberDto } from '../dto/get-member.dto';
import { ResponsePaginationDto } from '../dto/response/response-pagination.dto';
import { ResponseGetDto } from '../dto/response/response-get.dto';
import { ResponseDeleteDto } from '../dto/response/response-delete.dto';
import { FamilyService } from './family.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
    private readonly churchesService: ChurchesService,
    private readonly familyService: FamilyService,
  ) {}

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  async getMembers(churchId: number, dto: GetMemberDto, qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    const findOptionsWhere: FindOptionsWhere<MemberModel> = {
      churchId,
      name: dto.name ? ILike(`%${dto.name}%`) : undefined,
      //vehicleNumber: ArrayContains()
    };

    const totalCount = await membersRepository.count({
      where: findOptionsWhere,
    });

    const totalPage = Math.ceil(totalCount / dto.take);

    const result = await membersRepository.find({
      where: findOptionsWhere,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    return new ResponsePaginationDto<MemberModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  async getMemberById(
    churchId: number,
    memberId: number,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId,
      },
      relations,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return new ResponseGetDto<MemberModel>(member);
  }

  async getMemberModelById(
    churchId: number,
    memberId: number,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        id: memberId,
        churchId,
      },
      relations,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return member;
  }

  async getMemberModelByNameAndMobilePhone(
    churchId: number,
    name: string,
    mobilePhone: string,
    relations?: FindOptionsRelations<MemberModel>,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: {
        churchId,
        name,
        mobilePhone,
      },
      relations,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return member;
  }

  async createMember(churchId: number, dto: CreateMemberDto, qr: QueryRunner) {
    const church = await this.churchesService.findById(churchId, qr);

    const membersRepository = this.getMembersRepository(qr);

    const isExist = await this.isExistMemberByNameAndMobilePhone(
      churchId,
      dto.name,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new BadRequestException('이미 존재하는 교인입니다.');
    }

    // 인도자 처리
    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        churchId,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const newMember = await membersRepository.save({ ...dto, church });

    // 가족 등록
    if (dto.familyMemberId && dto.relation) {
      await this.fetchFamilyRelation(
        churchId,
        newMember.id,
        dto.familyMemberId,
        dto.relation,
        qr,
      );
    }

    const result = await membersRepository.findOne({
      where: { id: newMember.id },
    });

    if (!result) {
      throw new InternalServerErrorException('교인 생성 중 에러 발생');
    }
    return result;
  }

  async updateMember(
    churchId: number,
    memberId: number,
    dto: UpdateMemberDto,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    if (dto.guidedById) {
      const isExistGuide = await this.isExistMemberById(
        churchId,
        dto.guidedById,
        qr,
      );

      if (!isExistGuide) {
        throw new NotFoundException(
          '같은 교회에 해당 교인이 존재하지 않습니다.',
        );
      }
    }

    const result = await membersRepository.update(
      { id: memberId, churchId, deletedAt: IsNull() },
      { ...dto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return membersRepository.findOne({
      where: { id: memberId },
      relations: { guiding: true, guidedBy: true },
    });
  }

  async deleteMember(
    churchId: number,
    memberId: number,
  ): Promise<ResponseDeleteDto> {
    const result = await this.membersRepository.softDelete({
      id: memberId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 교인입니다.');
    }

    return {
      timestamp: new Date(),
      success: true,
      resultId: memberId,
    };
  }

  async isExistMemberById(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: { churchId, id: memberId },
    });

    return !!member;
  }

  async isExistMemberByNameAndMobilePhone(
    churchId: number,
    name: string,
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const membersRepository = this.getMembersRepository(qr);

    const member = await membersRepository.findOne({
      where: { churchId, name, mobilePhone },
    });

    return !!member;
  }

  async getFamilyRelation(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const member = await this.getMemberModelById(churchId, memberId, {}, qr);

    return this.familyService.getFamilyMember(member);
  }

  async fetchFamilyRelation(
    churchId: number,
    memberId: number,
    familyId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    const [member, familyMember] = await Promise.all([
      this.getMemberModelById(churchId, memberId, {}, qr),
      this.getMemberModelById(churchId, familyId, {}, qr),
    ]);

    return this.familyService.fetchAndCreateFamilyRelation(
      member,
      familyMember,
      relation,
      qr,
    );
  }

  async patchFamilyRelation(
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    return this.familyService.updateFamilyRelation(
      memberId,
      familyMemberId,
      relation,
      qr,
    );
  }

  async deleteFamilyRelation(
    memberId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    return this.familyService.deleteFamilyRelation(
      memberId,
      familyMemberId,
      qr,
    );
  }
}
