export abstract class BaseCursorPaginationResponseDto<T> {
  protected constructor(
    public readonly data: T[],
    public readonly count: number,
    public readonly nextCursor: string | undefined,
    public readonly hasMore: boolean,
    public readonly timestamp: Date = new Date(),
  ) {}
}
