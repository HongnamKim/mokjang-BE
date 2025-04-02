export class MemberDeletedEvent {
  constructor(
    public readonly churchId: number,
    public readonly memberId: number,

    public readonly attempt: number = 1,
    public readonly maxAttempts: number = 5,
  ) {}
}

export class MemberRestoredEvent {
  constructor(
    public readonly churchId: number,
    public readonly memberId: number,

    public readonly attempt: number = 1,
    public readonly maxAttempts: number = 5,
  ) {}
}
