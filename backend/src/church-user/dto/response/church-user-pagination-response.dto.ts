import { ChurchUserModel } from '../../entity/church-user.entity';

export class ChurchUserPaginationResponseDto {
  constructor(
    public readonly data: ChurchUserModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
