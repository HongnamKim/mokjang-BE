import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiPatchVisitationDetail } from '../const/swagger/visitation.swagger';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';
import { VisitationService } from '../visitation.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Visitations:Details')
@Controller('visitations/:visitationId/details')
export class VisitationDetailController {
  constructor(private readonly visitationService: VisitationService) {}

  @ApiPatchVisitationDetail()
  @Patch(':detailId')
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationService.updateVisitationDetail(
      churchId,
      visitationId,
      detailId,
      dto,
    );
  }
}
