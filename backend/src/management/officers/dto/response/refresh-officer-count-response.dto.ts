export class RefreshOfficerCountResponseDto {
  constructor(
    public readonly officerCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
