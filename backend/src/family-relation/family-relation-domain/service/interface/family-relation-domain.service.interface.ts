import { MemberModel } from '../../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { FamilyRelationModel } from '../../../entity/family-relation.entity';

export const IFAMILY_RELATION_DOMAIN_SERVICE = Symbol(
  'IFAMILY_RELATION_DOMAIN_SERVICE',
);

export interface IFamilyRelationDomainService {
  findFamilyRelations(
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<FamilyRelationModel[]>;

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
  ): Promise<FamilyRelationModel>;

  deleteFamilyRelation(
    familyRelation: FamilyRelationModel,
    qr?: QueryRunner,
  ): Promise<string>;

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
