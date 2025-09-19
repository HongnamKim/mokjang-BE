import { MemberModel } from '../../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { FamilyRelationModel } from '../../../entity/family-relation.entity';
import { GetFamilyRelationListDto } from '../../../dto/get-family-relation-list.dto';
import { DomainCursorPaginationResultDto } from '../../../../common/dto/domain-cursor-pagination-result.dto';

export const IFAMILY_RELATION_DOMAIN_SERVICE = Symbol(
  'IFAMILY_RELATION_DOMAIN_SERVICE',
);

export interface IFamilyRelationDomainService {
  findFamilyRelations(
    member: MemberModel,
    dto: GetFamilyRelationListDto,
    qr?: QueryRunner,
  ): Promise<DomainCursorPaginationResultDto<FamilyRelationModel>>;

  findFamilyRelationById(
    meId: number,
    familyId: number,
    qr?: QueryRunner,
  ): Promise<FamilyRelationModel>;

  findFamilyRelationModelById(
    meId: number,
    familyId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<FamilyRelationModel>,
  ): Promise<FamilyRelationModel>;

  fetchAndCreateFamilyRelations(
    me: MemberModel,
    newFamilyMember: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ): Promise<FamilyRelationModel[]>;

  updateFamilyRelation(
    familyRelation: FamilyRelationModel,
    relation: string,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteFamilyRelation(
    familyRelation: FamilyRelationModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  createFamilyRelation(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ): Promise<FamilyRelationModel>;

  deleteAllFamilyRelations(
    deletedMember: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
