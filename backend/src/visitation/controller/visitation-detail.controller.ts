import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiPatchVisitationDetail } from '../const/swagger/visitation.swagger';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';
import { VisitationService } from '../service/visitation.service';
import { ApiTags } from '@nestjs/swagger';
import { VisitationDetailService } from '../service/visitation-detail.service';

@ApiTags('Visitations:Details')
@Controller('visitations/:visitationId/details')
export class VisitationDetailController {
  constructor(
    private readonly visitationDetailService: VisitationDetailService,
  ) {}

  @ApiPatchVisitationDetail()
  @Patch(':memberId')
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationDetailService.updateVisitationDetail(
      churchId,
      visitationId,
      memberId,
      dto,
    );
  }
}
