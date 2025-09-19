import { DomainType } from '../const/domain-type.enum';
import { DomainAction } from '../const/domain-action.enum';

export const MIN_PERMISSION_UNIT_COUNT = 1;
export const MAX_PERMISSION_UNIT_COUNT =
  Object.values(DomainType).length * Object.values(DomainAction).length;

export const MAX_PERMISSION_TEMPLATE_TITLE_LENGTH = 50;
export const MIN_PERMISSION_TEMPLATE_TITLE_LENGTH = 2;

export const MAX_PERMISSION_TEMPLATE_COUNT = 50;
