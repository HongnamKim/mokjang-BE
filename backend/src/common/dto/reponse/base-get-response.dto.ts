export abstract class BaseGetResponseDto<T> {
  protected constructor(data: T, timestamp: Date = new Date()) {}
}
