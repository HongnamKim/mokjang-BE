import { VisitationMetaModel } from '../../entity/visitation-meta.entity';

export class VisitationPaginationResultDto {
  constructor(
    public readonly data: VisitationMetaModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
