import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { MinistryGroupService } from '../service/ministry-group.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMinistryGroupDto } from '../dto/create-ministry-group.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMinistryGroupDto } from '../dto/update-ministry-group.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:MinistryGroups')
@Controller('ministry-groups')
export class MinistryGroupsController {
  constructor(private readonly ministryGroupService: MinistryGroupService) {}

  @Get()
  getMinistryGroups(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.ministryGroupService.getMinistryGroups(churchId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.createMinistryGroup(churchId, dto, qr);
  }

  @Get(':ministryGroupId')
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
      '최상위 그룹으로 설정하려는 경우 parentMinistryGroupId 를 0 으로 설정',
  })
  @Patch(':ministryGroupId')
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
