export class RefreshMinistryCountResponseDto {
  constructor(
    public readonly ministryCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
