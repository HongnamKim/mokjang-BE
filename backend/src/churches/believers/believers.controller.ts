import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { BelieversService } from './believers.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiTags } from '@nestjs/swagger';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';

@ApiTags('Churches:Believers')
@Controller('churches/:churchId/believers')
export class BelieversController {
  constructor(private readonly believersService: BelieversService) {}

  @Post('invite')
  async postInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateInvitationDto,
  ) {
    const invitation = await this.believersService.createInvitation(
      churchId,
      dto,
    );
  }

  @Post('validate-invite/:invitationId')
  validateInvitation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: ValidateInvitationDto,
  ) {
    this.believersService.validateInvitation(churchId, invitationId, dto);
  }
}
