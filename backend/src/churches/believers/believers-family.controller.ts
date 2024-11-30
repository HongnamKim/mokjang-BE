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
import { CreateFamilyDto } from './dto/create-family.dto';
import { FamilyService } from './family.service';
import { BelieversService } from './believers.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller(':believerId/family')
export class BelieversFamilyController {
  constructor(private readonly believersService: BelieversService) {}

  @Get()
  getFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postFamilyMember(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
    @Body() dto: CreateFamilyDto,
    @QueryRunner() qr: QR,
  ) {
    return this.believersService.postFamilyMember(
      churchId,
      believerId,
      dto.familyId,
      dto.relation,
      qr,
    );
  }

  @Patch()
  patchFamilyMember() {}

  @Delete()
  deleteFamilyMember() {}
}
