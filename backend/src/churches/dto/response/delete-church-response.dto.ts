export class DeleteChurchResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly success: boolean,
  ) {}
}
