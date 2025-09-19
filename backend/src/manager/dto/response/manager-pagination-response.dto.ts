import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export class ManagerPaginationResponseDto {
  constructor(
    public readonly data: ChurchUserModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
