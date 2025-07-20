import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinistryService } from '../service/ministry.service';
import { CreateMinistryDto } from '../dto/ministry/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/ministry/update-ministry.dto';
import { GetMinistryDto } from '../dto/ministry/get-ministry.dto';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteMinistry,
  ApiGetMinistries,
  ApiPatchMinistry,
  ApiPostMinistry,
  ApiRefreshMinistryCount,
} from '../const/swagger/ministry.swagger';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { PermissionChurch } from '../../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';

@ApiTags('Management:MinistryGroups:Ministries')
@Controller('ministry-groups/:ministryGroupId/ministries')
export class MinistriesController {
  constructor(private readonly ministryService: MinistryService) {}

  @ApiGetMinistries()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @Get()
  getMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Query() dto: GetMinistryDto,
  ) {
    return this.ministryService.getMinistries(churchId, ministryGroupId, dto);
  }

  @ApiPostMinistry()
  @MinistryWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: CreateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.createMinistry(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @ApiRefreshMinistryCount()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Patch('refresh-count')
  refreshMinistryCount(
    @PermissionChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.refreshMinistryCount(church, qr);
  }

  @ApiPatchMinistry()
  @MinistryWriteGuard()
  @Patch(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  patchMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: UpdateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.updateMinistry(
      churchId,
      ministryGroupId,
      ministryId,
      dto,
      qr,
    );
  }

  @ApiDeleteMinistry()
  @MinistryWriteGuard()
  @Delete(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  deleteMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.deleteMinistry(
      churchId,
      ministryGroupId,
      ministryId,
      qr,
    );
  }
}
