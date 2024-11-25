import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiTags } from '@nestjs/swagger';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { GetInvitationDto } from './dto/get-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiTags('Churches:Invitations')
@Controller('churches/:churchId/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  getInvitations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetInvitationDto,
  ) {
    return this.invitationService.findAllInvitations(churchId, dto);
  }

  @Post()
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

  @Delete(':invitationId')
  deleteInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
  ) {
    return this.invitationService.deleteInvitationById(churchId, invitationId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':invitationId/validation')
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

  @Post(':invitationId/accept')
  @UseInterceptors(TransactionInterceptor)
  acceptInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: AcceptInvitationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.invitationService.acceptInvitation(
      churchId,
      invitationId,
      dto,
      qr,
    );
  }
}
