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
import { EducationsService } from '../service/educations.service';
import { GetEducationDto } from '../dto/education/get-education.dto';
import {
  ApiDeleteEducation,
  ApiGetEducation,
  ApiGetEducationById,
  ApiPatchEducation,
  ApiPostEducation,
} from '../const/swagger/education.swagger';
import { CreateEducationDto } from '../dto/education/create-education.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateEducationDto } from '../dto/education/update-education.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../churches/guard/church-guard.service';
import { Token } from '../../../auth/decorator/jwt.decorator';
import { AuthType } from '../../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../../auth/type/jwt';
import { EducationTermService } from '../service/education-term.service';
import { GetInProgressEducationTermDto } from '../dto/terms/request/get-in-progress-education-term.dto';

@ApiTags('Management:Educations')
@Controller('educations')
export class EducationsController {
  constructor(
    private readonly educationsService: EducationsService,
    private readonly educationTermService: EducationTermService,
  ) {}

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
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postEducation(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateEducationDto,
    @QueryRunner() qr: QR,
  ) {
    const userId = accessPayload.id;
    return this.educationsService.createEducation(userId, churchId, dto, qr);
  }

  @Get('in-progress')
  getInProgressEducations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetInProgressEducationTermDto,
  ) {
    return this.educationTermService.getInProgressEducationTerms(churchId, dto);
  }

  @ApiGetEducationById()
  @Get(':educationId')
  getEducationById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
  ) {
    return this.educationsService.getEducationById(churchId, educationId);
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
