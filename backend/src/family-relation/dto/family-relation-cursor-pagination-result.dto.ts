import { BaseCursorPaginationResponseDto } from '../../common/dto/base-cursor-pagination-response.dto';
import { FamilyRelationModel } from '../entity/family-relation.entity';

export class FamilyRelationCursorPaginationResultDto extends BaseCursorPaginationResponseDto<FamilyRelationModel> {
  constructor(
    data: FamilyRelationModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
