import { Test, TestingModule } from '@nestjs/testing';
import { DowJonesService } from './dow-jones.service';

describe('DowJonesService', () => {
  let service: DowJonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DowJonesService],
    }).compile();

    service = module.get<DowJonesService>(DowJonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
