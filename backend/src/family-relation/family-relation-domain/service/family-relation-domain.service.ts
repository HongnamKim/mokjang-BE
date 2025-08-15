import { IFamilyRelationDomainService } from './interface/family-relation-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyRelationModel } from '../../entity/family-relation.entity';
import {
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MemberModel } from '../../../members/entity/member.entity';
import { FamilyRelationException } from '../../const/exception/family-relation.exception';
import { Gender } from '../../../members/const/enum/gender.enum';
import {
  GenderBasedRelations,
  NeutralRelations,
} from '../const/family-relation.rules';
import { FamilyRelationConst } from '../const/family-relation.const';
import { FamilyRelation } from '../const/family-relation.interface';
import { GetFamilyRelationListDto } from '../../dto/get-family-relation-list.dto';
import { MemberSummarizedSelect } from '../../../members/const/member-find-options.const';

@Injectable()
export class FamilyRelationDomainService
  implements IFamilyRelationDomainService
{
  constructor(
    @InjectRepository(FamilyRelationModel)
    private readonly familyRepository: Repository<FamilyRelationModel>,
  ) {}

  private getFamilyRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(FamilyRelationModel)
      : this.familyRepository;
  }

  async findFamilyRelations(
    member: MemberModel,
    dto: GetFamilyRelationListDto,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const query = familyRepository
      .createQueryBuilder('family')
      .where('family.meId = :meId', { meId: member.id })
      .leftJoin('family.familyMember', 'familyMember')
      .addSelect([
        'familyMember.id',
        'familyMember.name',
        'familyMember.profileImageUrl',
        'familyMember.mobilePhone',
        'familyMember.registeredAt',
        'familyMember.birth',
        'familyMember.isLunar',
        'familyMember.isLeafMonth',
        'familyMember.groupRole',
        'familyMember.ministryGroupRole',
      ])
      .leftJoin('familyMember.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .leftJoin('familyMember.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .orderBy('familyMember.birth', dto.sortDirection)
      .addOrderBy('familyMember.id', dto.sortDirection);

    if (dto.cursor) {
      this.applyCursorPagination(query, dto.cursor, dto.sortDirection);
    }

    const items = await query.limit(dto.limit + 1).getMany();

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor = hasMore
      ? this.encodeCursor(items[items.length - 1])
      : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  private applyCursorPagination(
    query: SelectQueryBuilder<FamilyRelationModel>,
    cursor: string,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const decodedCursor = this.decodeCursor(cursor);

    if (!decodedCursor) return;

    const { familyMemberId, value } = decodedCursor;

    if (sortDirection === 'ASC') {
      if (value === null) {
        // 이전 커서의 birth가 NULL인 경우
        // NULL은 마지막에 오므로, NULL이면서 id가 큰 것만
        query.andWhere(
          `(familyMember.birth IS NULL AND familyMember.id > :id)`,
          { id: familyMemberId },
        );
      } else {
        // 이전 커서의 birth가 값이 있는 경우
        query.andWhere(
          `(familyMember.birth > :birth 
          OR (familyMember.birth = :birth AND familyMember.id > :id)
          OR familyMember.birth IS NULL)`,
          { birth: value, id: familyMemberId },
        );
      }
    } else {
      // DESC
      if (value === null) {
        // DESC에서 NULL은 처음에 옴, 다음은 값이 있는 것들
        query.andWhere(`familyMember.birth IS NOT NULL`);
      } else {
        query.andWhere(
          `(familyMember.birth < :birth 
          OR (familyMember.birth = :birth AND familyMember.id > :id))`,
          { birth: value, id: familyMemberId },
        );
      }
    }
  }

  private encodeCursor(familyRelation: FamilyRelationModel) {
    const cursorData = {
      familyMemberId: familyRelation.familyMemberId,
      value: familyRelation.familyMember.birth,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  private decodeCursor(cursor: string) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  async findFamilyRelationById(
    meId: number,
    familyId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getFamilyRepository(qr);

    const relation = await repository.findOne({
      where: {
        meId,
        familyMemberId: familyId,
      },
      relations: {
        familyMember: {
          officer: true,
          group: true,
        },
      },
      select: {
        familyMember: MemberSummarizedSelect,
      },
    });

    if (!relation) {
      throw new NotFoundException(FamilyRelationException.NOT_FOUND);
    }

    return relation;
  }

  async findFamilyRelationModelById(
    meId: number,
    familyId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<FamilyRelationModel>,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const relation = await familyRepository.findOne({
      where: {
        meId,
        familyMemberId: familyId,
      },
      relations: relationOptions,
    });

    if (!relation) {
      throw new NotFoundException(FamilyRelationException.NOT_FOUND);
    }

    return relation;
  }

  private async isExistFamilyRelation(
    me: MemberModel,
    family: MemberModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await familyRepository.findOne({
      where: {
        meId: me.id,
        familyMemberId: family.id,
      },
    });

    return !!isExist;
  }

  private async findFamilyMemberIds(member: MemberModel, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    const ids = (
      await familyRepository.find({
        where: {
          meId: member.id,
        },
        select: {
          familyMemberId: true,
        },
      })
    ).map((relation) => relation.familyMemberId);

    ids.push(member.id);

    return ids;
  }

  async fetchAndCreateFamilyRelations(
    me: MemberModel,
    newFamilyMember: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(me, newFamilyMember, qr);

    if (isExist) {
      throw new ConflictException(FamilyRelationException.ALREADY_EXISTS);
    }

    const [newFamilyIds, myFamilyIds] = await Promise.all([
      this.findFamilyMemberIds(newFamilyMember, qr),
      this.findFamilyMemberIds(me, qr),
    ]);

    const familyRelations = this.buildFamilyRelations(
      me,
      newFamilyMember,
      myFamilyIds,
      newFamilyIds,
      relation,
    );

    return familyRepository.save(familyRelations);
  }

  private buildFamilyRelations(
    me: MemberModel,
    newFamily: MemberModel,
    myFamilyIds: number[],
    newFamilyIds: number[],
    relation: string,
  ) {
    const relations: FamilyRelation[] = [];

    for (const newFamilyId of newFamilyIds) {
      for (const myFamilyId of myFamilyIds) {
        const isRelationFixed =
          myFamilyId === me.id && newFamilyId === newFamily.id;

        relations.push(
          {
            meId: myFamilyId,
            familyMemberId: newFamilyId,
            relation: isRelationFixed ? relation : FamilyRelationConst.FAMILY,
          },
          {
            meId: newFamilyId,
            familyMemberId: myFamilyId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelationConst.FAMILY,
          },
        );
      }
    }

    return relations;
  }

  private getCounterRelation(relation: string, me: MemberModel) {
    if (NeutralRelations.has(relation)) {
      return relation;
    }

    if (GenderBasedRelations[relation]) {
      if (!me.gender) return FamilyRelationConst.FAMILY;

      return me.gender === Gender.MALE
        ? GenderBasedRelations[relation][0]
        : GenderBasedRelations[relation][1];
    }

    return FamilyRelationConst.FAMILY;
  }

  async updateFamilyRelation(
    familyRelation: FamilyRelationModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      {
        meId: familyRelation.meId,
        familyMemberId: familyRelation.familyMemberId,
        deletedAt: IsNull(),
      },
      {
        relation,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        FamilyRelationException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteFamilyRelation(
    familyRelation: FamilyRelationModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      meId: familyRelation.meId,
      familyMemberId: familyRelation.familyMemberId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        FamilyRelationException.DELETE_ERROR,
      );
    }

    return result;
  }

  async createFamilyRelation(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExistRelation = await this.isExistFamilyRelation(
      me,
      familyMember,
      qr,
    );

    if (isExistRelation) {
      throw new ConflictException(FamilyRelationException.ALREADY_EXISTS);
    }

    // 상대 가족은 나를 가족으로 생성했는지
    // 생성되어있으면 생략
    const isExistingCounterRelation = await this.isExistFamilyRelation(
      familyMember,
      me,
      qr,
    );

    const familyRelation: FamilyRelation[] = [];

    familyRelation.push({
      meId: me.id,
      familyMemberId: familyMember.id,
      relation,
    });

    if (!isExistingCounterRelation) {
      familyRelation.push({
        meId: familyMember.id,
        familyMemberId: me.id,
        relation: this.getCounterRelation(relation, me),
      });
    }

    await familyRepository.save(familyRelation);

    return this.findFamilyRelationModelById(me.id, familyMember.id, qr, {
      familyMember: true,
    });
  }

  async deleteAllFamilyRelations(deletedMember: MemberModel, qr: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return familyRepository
      .createQueryBuilder()
      .softDelete()
      .where('meId = :deletedId OR familyMemberId = :deletedId', {
        deletedId: deletedMember.id,
      })
      .execute();
  }
}
