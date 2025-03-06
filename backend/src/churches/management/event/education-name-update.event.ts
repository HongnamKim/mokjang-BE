export class EducationNameUpdateEvent {
  constructor(
    public readonly educationId: number,
    public readonly educationName: string,

    public readonly attempt: number = 1,
    public readonly maxAttempts: number = 5,
  ) {}
}
