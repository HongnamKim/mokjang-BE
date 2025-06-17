import { Inject, Injectable } from '@nestjs/common';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';

@Injectable()
export class WorshipSessionService {
  constructor(
    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
  ) {}
}
