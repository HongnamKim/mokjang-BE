export enum ManagerOrder {
  JOINED_AT = 'joinedAt',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const UserOrderCriteria = [ManagerOrder.JOINED_AT, ManagerOrder.ROLE];

export const MemberOrderCriteria = [
  ManagerOrder.CREATED_AT,
  ManagerOrder.UPDATED_AT,
];
