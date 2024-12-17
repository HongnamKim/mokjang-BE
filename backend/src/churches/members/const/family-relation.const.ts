export type FamilyRelationType =
  (typeof FamilyRelation)[keyof typeof FamilyRelation];

export const FamilyRelation = {
  DEFAULT: '가족',
  SPOUSE: '배우자',
  FATHER: '부',
  MOTHER: '모',
  CHILD: '자녀',
  BROTHER: '형제',
  GRAND_PARENTS: '조부모',
  GRAND_SON: '손자',
  GRAND_DAUGHTER: '손녀',
  SON_IN_LAW: '사위',
  DAUGHTER_IN_LAW: '며느리',
  FATHER_IN_LAW_W: '시부',
  MOTHER_IN_LAW_W: '시모',
  FATHER_IN_LAW_M: '장인',
  MOTHER_IN_LAW_M: '장모',
  COUSIN: '친인척',
  //SON: '아들',
  //DAUGHTER: '딸',
  //GRANDFATHER: '할아버지',
  //GRANDMOTHER: '할머니',
  //SISTER: '자매',
  //남매: '남매',
};
