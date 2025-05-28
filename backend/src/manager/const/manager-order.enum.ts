export enum ManagerOrder {
  CHURCH_JOINED_AT = 'churchJoinedAt',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const UserOrderCriteria = [
  ManagerOrder.CHURCH_JOINED_AT,
  ManagerOrder.ROLE,
];

export const MemberOrderCriteria = [
  ManagerOrder.CREATED_AT,
  ManagerOrder.UPDATED_AT,
];
