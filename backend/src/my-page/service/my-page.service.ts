import { Inject, Injectable } from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { GetMeResponseDto } from '../dto/response/get-me-response.dto';

@Injectable()
export class MyPageService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  async getMe(userId: number) {
    const me = await this.userDomainService.findUserById(userId);

    return new GetMeResponseDto(me);
  }
}
