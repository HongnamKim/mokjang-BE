import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiTags } from '@nestjs/swagger';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@ApiTags('Churches:Believers')
@Controller('churches/:churchId/believers')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('invite')
  @UseInterceptors(TransactionInterceptor)
  async postInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateInvitationDto,
    @QueryRunner() qr: QR,
  ) {
    const invitation = await this.invitationService.createInvitation(
      churchId,
      dto,
      qr,
    );

    return this.invitationService.generateInviteUrl(invitation);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-invite/:invitationId')
  validateInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: ValidateInvitationDto,
  ) {
    return this.invitationService.validateInvitation(
      churchId,
      invitationId,
      dto,
    );
  }

  @Get('test-url')
  getInviteUrl() {}
}
