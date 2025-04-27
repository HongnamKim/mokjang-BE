export abstract class BaseDeleteResultDto {
  protected constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly success: boolean,
  ) {}
}
