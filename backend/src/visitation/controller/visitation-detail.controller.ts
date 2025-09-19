import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiPatchVisitationDetail } from '../const/swagger/visitation.swagger';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';
import { ApiTags } from '@nestjs/swagger';
import { VisitationDetailService } from '../service/visitation-detail.service';
import { VisitationWriteGuard } from '../guard/visitation-write.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

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
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateVisitationDetailDto,
  ) {
    return this.visitationDetailService.updateVisitationDetail(
      church,
      visitationId,
      dto,
    );
  }
}
