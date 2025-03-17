import { MinistryGroupModel } from '../../entity/ministry-group.entity';

export const IMINISTRY_GROUPS_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUPS_DOMAIN_SERVICE',
);

export interface ParentMinistryGroup {
  id: number;
  name: string;
  parentMinistryGroupId: number | null;
  depth: number;
}

export interface MinistryGroupWithParentGroups extends MinistryGroupModel {
  parentMinistryGroups: ParentMinistryGroup[];
}

export interface IMinistryGroupsDomainService {}
