export class PostBulkMembersResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly count: number,
    public readonly success: boolean,
  ) {}
}
