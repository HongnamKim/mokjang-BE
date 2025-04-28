export abstract class BasePatchResponseDto<T> {
  protected constructor(
    public readonly data: T,
    public readonly timestamp: Date = new Date(),
  ) {}
}
