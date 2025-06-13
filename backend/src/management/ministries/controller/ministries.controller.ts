import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  ApiGetMinistryById,
  ApiPatchMinistry,
  ApiPostMinistry,
  ApiRefreshMinistryMembersCount,
} from '../const/swagger/ministry.swagger';
import { MinistryReadGuard } from '../guard/ministry-read.guard';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';

@ApiTags('Management:Ministries')
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly ministryService: MinistryService) {}

  @ApiGetMinistries()
  @MinistryReadGuard()
  @Get()
  getMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMinistryDto,
  ) {
    return this.ministryService.getMinistries(churchId, dto);
  }

  @ApiPostMinistry()
  @MinistryWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMinistries(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.createMinistry(churchId, dto, qr);
  }

  @ApiGetMinistryById()
  @MinistryReadGuard()
  @Get(':ministryId')
  getMinistryById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    throw new GoneException('더 이상 사용되지 않는 요청');

    //return this.ministryService.getMinistryById(churchId, ministryId);
  }

  @ApiPatchMinistry()
  @MinistryWriteGuard()
  @Patch(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  patchMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @Body() dto: UpdateMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.updateMinistry(churchId, ministryId, dto, qr);
  }

  @ApiDeleteMinistry()
  @MinistryWriteGuard()
  @Delete(':ministryId')
  @UseInterceptors(TransactionInterceptor)
  deleteMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryService.deleteMinistry(churchId, ministryId, qr);
  }

  @ApiRefreshMinistryMembersCount()
  @MinistryWriteGuard()
  @Patch(':ministryId/refresh-members-count')
  refreshMembersCount(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryId', ParseIntPipe) ministryId: number,
  ) {
    return this.ministryService.refreshMinistryMemberCount(
      churchId,
      ministryId,
    );
  }
}
