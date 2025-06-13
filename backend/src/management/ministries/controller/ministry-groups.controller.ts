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
  UseInterceptors,
} from '@nestjs/common';
import { MinistryGroupService } from '../service/ministry-group.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMinistryGroupDto } from '../dto/ministry-group/create-ministry-group.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMinistryGroupDto } from '../dto/ministry-group/update-ministry-group.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { GetMinistryGroupDto } from '../dto/ministry-group/get-ministry-group.dto';
import { MinistryReadGuard } from '../guard/ministry-read.guard';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';

@ApiTags('Management:MinistryGroups')
@Controller('ministry-groups')
export class MinistryGroupsController {
  constructor(private readonly ministryGroupService: MinistryGroupService) {}

  @Get()
  @MinistryReadGuard()
  getMinistryGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMinistryGroupDto,
  ) {
    return this.ministryGroupService.getMinistryGroups(churchId, dto);
  }

  @Post()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.createMinistryGroup(churchId, dto, qr);
  }

  @Get(':ministryGroupId')
  @MinistryReadGuard()
  getMinistryGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
  ) {
    return this.ministryGroupService.getMinistryGroupById(
      churchId,
      ministryGroupId,
    );
  }

  @ApiOperation({
    summary: '사역 그룹 수정',
    description:
      '최상위 그룹으로 설정하려는 경우 parentMinistryGroupId 를 null 로 설정',
  })
  @Patch(':ministryGroupId')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: UpdateMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroup(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @Delete(':ministryGroupId')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.deleteMinistryGroup(
      churchId,
      ministryGroupId,
      qr,
    );
  }

  @Get(':ministryGroupId/childGroups')
  @MinistryReadGuard()
  getChildGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
  ) {
    return this.ministryGroupService.getMinistryGroupsCascade(
      churchId,
      ministryGroupId,
    );
  }
}
