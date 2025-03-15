import { Injectable } from '@nestjs/common';
import { IOfficersDomainService } from './interface/officers-domain.service.interface';

@Injectable()
export class OfficersDomainService implements IOfficersDomainService {}
