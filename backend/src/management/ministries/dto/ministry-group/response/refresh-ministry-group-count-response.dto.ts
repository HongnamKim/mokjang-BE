export class RefreshMinistryGroupCountResponseDto {
  constructor(
    public readonly ministryGroupCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
