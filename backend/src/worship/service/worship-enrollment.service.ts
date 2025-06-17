import { Inject, Injectable } from '@nestjs/common';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';

@Injectable()
export class WorshipEnrollmentService {
  constructor(
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
  ) {}
}
