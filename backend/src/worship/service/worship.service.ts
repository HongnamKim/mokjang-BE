import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';

@Injectable()
export class WorshipService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
  ) {}
}
