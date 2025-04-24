export class DeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly name: string,
    public readonly success: boolean,
  ) {}
}
