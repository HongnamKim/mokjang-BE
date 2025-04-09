export enum RequestLimitValidationType {
  INIT,
  INCREASE,
  ERROR,
}

export interface RequestLimitValidationResult {
  isValid: boolean;
  type: RequestLimitValidationType;
  error?: string;
}
