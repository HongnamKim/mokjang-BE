export type FamilyRelationType =
  (typeof FamilyRelation)[keyof typeof FamilyRelation];

export const FamilyRelation = {
  FATHER: '아버지',
  MOTHER: '어머니',
  SON: '아들',
  DAUGHTER: '딸',
  GRANDFATHER: '할아버지',
  GRANDMOTHER: '할머니',
  GRANDSON: '손자',
  GRANDDAUGHTER: '손녀',
  BROTHER: '형제',
  SISTER: '자매',
  남매: '남매',
  DEFAULT: '가족',
};
