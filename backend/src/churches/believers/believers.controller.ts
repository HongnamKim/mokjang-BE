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
import { BelieversService } from './believers.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBelieverDto } from './dto/create-believer.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateBelieverDto } from './dto/update-believer.dto';
import { DefaultBelieverRelationOption } from './const/default-find-options.const';
import { GetBelieverDto } from './dto/get-believer.dto';

@ApiTags('Churches:Believers')
@Controller()
export class BelieversController {
  constructor(private readonly believersService: BelieversService) {}

  @Get()
  getBelievers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetBelieverDto,
  ) {
    return this.believersService.getBelievers(churchId, dto);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postBeliever(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateBelieverDto,
    @QueryRunner() qr: QR,
  ) {
    return this.believersService.createBelievers(churchId, dto, qr);
  }

  @Get(':believerId')
  getBelieverById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
  ) {
    return this.believersService.getBelieversById(
      churchId,
      believerId,
      DefaultBelieverRelationOption,
    );
  }

  @Patch(':believerId')
  patchBeliever(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
    @Body() dto: UpdateBelieverDto,
  ) {
    return this.believersService.updateBeliever(churchId, believerId, dto);
  }

  @Delete(':believerId')
  deleteBeliever(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('believerId', ParseIntPipe) believerId: number,
  ) {
    return this.believersService.deleteBeliever(churchId, believerId);
  }
}
