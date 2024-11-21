import { Test, TestingModule } from '@nestjs/testing';
import { BelieversService } from '../believers.service';

describe('BelieversService', () => {
  let service: BelieversService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BelieversService],
    }).compile();

    service = module.get<BelieversService>(BelieversService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
