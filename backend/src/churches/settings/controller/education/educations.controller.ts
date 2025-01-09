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
import { ApiTags } from '@nestjs/swagger';
import { EducationsService } from '../../service/educations.service';
import { GetEducationDto } from '../../dto/education/education/get-education.dto';
import {
  ApiDeleteEducation,
  ApiGetEducation,
  ApiPatchEducation,
  ApiPostEducation,
} from '../../const/swagger/education/controller.swagger';
import { CreateEducationDto } from '../../dto/education/education/create-education.dto';
import { QueryRunner } from '../../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../../common/interceptor/transaction.interceptor';
import { UpdateEducationDto } from '../../dto/education/education/update-education.dto';

@ApiTags('Management:Educations')
@Controller('educations')
export class EducationsController {
  constructor(private readonly educationsService: EducationsService) {}

  @ApiGetEducation()
  @Get()
  getEducations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetEducationDto,
  ) {
    return this.educationsService.getEducations(churchId, dto);
  }

  @ApiPostEducation()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateEducationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.createEducation(churchId, dto, qr);
  }

  @ApiPatchEducation()
  @Patch(':educationId')
  @UseInterceptors(TransactionInterceptor)
  patchEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: UpdateEducationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.updateEducation(
      churchId,
      educationId,
      dto,
      qr,
    );
  }

  @ApiDeleteEducation()
  @Delete(':educationId')
  deleteEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
  ) {
    return this.educationsService.deleteEducation(churchId, educationId);
  }
}
