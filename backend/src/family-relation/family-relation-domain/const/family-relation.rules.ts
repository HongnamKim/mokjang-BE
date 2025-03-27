import { FamilyRelationConst } from './family-relation.const';

export const NeutralRelations = new Set([
  FamilyRelationConst.BROTHER,
  FamilyRelationConst.SISTER,
  FamilyRelationConst.SIBLING,
  FamilyRelationConst.RELATIVE,
  FamilyRelationConst.FAMILY,
]);

export const GenderBasedRelations = {
  [FamilyRelationConst.GRANDFATHER]: [
    FamilyRelationConst.GRANDSON,
    FamilyRelationConst.GRANDDAUGHTER,
  ],
  [FamilyRelationConst.GRANDMOTHER]: [
    FamilyRelationConst.GRANDSON,
    FamilyRelationConst.GRANDDAUGHTER,
  ],
  [FamilyRelationConst.GRANDSON]: [
    FamilyRelationConst.GRANDFATHER,
    FamilyRelationConst.GRANDMOTHER,
  ],
  [FamilyRelationConst.GRANDDAUGHTER]: [
    FamilyRelationConst.GRANDFATHER,
    FamilyRelationConst.GRANDMOTHER,
  ],
  [FamilyRelationConst.FATHER]: [
    FamilyRelationConst.SON,
    FamilyRelationConst.DAUGHTER,
  ],
  [FamilyRelationConst.MOTHER]: [
    FamilyRelationConst.SON,
    FamilyRelationConst.DAUGHTER,
  ],
  [FamilyRelationConst.SON]: [
    FamilyRelationConst.FATHER,
    FamilyRelationConst.MOTHER,
  ],
  [FamilyRelationConst.DAUGHTER]: [
    FamilyRelationConst.FATHER,
    FamilyRelationConst.MOTHER,
  ],
  [FamilyRelationConst.SON_IN_LAW]: [
    FamilyRelationConst.WIFE_FATHER_IN_LAW,
    FamilyRelationConst.WIFE_MOTHER_IN_LAW,
  ],
  [FamilyRelationConst.DAUGHTER_IN_LAW]: [
    FamilyRelationConst.HUSBAND_FATHER_IN_LAW,
    FamilyRelationConst.HUSBAND_MOTHER_IN_LAW,
  ],
  [FamilyRelationConst.HUSBAND_FATHER_IN_LAW]:
    FamilyRelationConst.DAUGHTER_IN_LAW,
  [FamilyRelationConst.HUSBAND_MOTHER_IN_LAW]:
    FamilyRelationConst.DAUGHTER_IN_LAW,
  [FamilyRelationConst.WIFE_FATHER_IN_LAW]: FamilyRelationConst.SON_IN_LAW,
  [FamilyRelationConst.WIFE_MOTHER_IN_LAW]: FamilyRelationConst.SON_IN_LAW,
};
