import { Injectable } from '@nestjs/common';
import { IVisitationDetailDomainService } from './interface/visitation-detail-domain.service.interface';

@Injectable()
export class VisitationDetailDomainService
  implements IVisitationDetailDomainService
{
  constructor() {}
}
