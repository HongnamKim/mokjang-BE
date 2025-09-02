import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiPatchVisitationDetail } from '../const/swagger/visitation.swagger';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';
import { ApiTags } from '@nestjs/swagger';
import { VisitationDetailService } from '../service/visitation-detail.service';
import { VisitationWriteGuard } from '../guard/visitation-write.guard';

@ApiTags('Visitations:Details')
@Controller('visitations/:visitationId/details')
export class VisitationDetailController {
  constructor(
    private readonly visitationDetailService: VisitationDetailService,
  ) {}

  @ApiPatchVisitationDetail()
  @VisitationWriteGuard()
  @Patch()
  patchVisitationDetail(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('visitationId', ParseIntPipe) visitationId: number,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationDetailService.updateVisitationDetail(
      churchId,
      visitationId,
      dto,
    );
  }
}
