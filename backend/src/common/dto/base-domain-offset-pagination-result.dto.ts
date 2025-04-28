export abstract class BaseDomainOffsetPaginationResultDto<T> {
  protected constructor(
    public readonly data: T[],
    public readonly totalCount: number,
  ) {}
}
