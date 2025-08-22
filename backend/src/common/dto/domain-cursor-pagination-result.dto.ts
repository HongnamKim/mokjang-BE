export class DomainCursorPaginationResultDto<T> {
  constructor(
    public readonly items: T[],
    public readonly nextCursor: string | undefined,
    public readonly hasMore: boolean,
  ) {}
}
