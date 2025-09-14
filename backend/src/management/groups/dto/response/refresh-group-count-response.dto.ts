export class RefreshGroupCountResponseDto {
  constructor(
    public readonly groupCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
