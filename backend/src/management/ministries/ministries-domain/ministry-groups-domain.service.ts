import { Injectable } from '@nestjs/common';
import { IMinistryGroupsDomainService } from './interface/ministry-groups-domain.service.interface';

@Injectable()
export class MinistryGroupsDomainService
  implements IMinistryGroupsDomainService {}
