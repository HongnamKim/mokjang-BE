export interface BasePaginationResultDto<T> {
  data: T[];
  totalCount: number;
  count: number;
  page: number;
}
