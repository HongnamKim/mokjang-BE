export class PatchWorshipAllAttendedResponseDto {
  constructor(
    public readonly success: boolean,
    public readonly changedCount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
