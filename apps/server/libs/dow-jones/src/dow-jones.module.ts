import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import dowJonesConfig from 'config/dowJonesConfig';
import { DowJonesApiService } from './dow-jones-api.service';
import { DowJonesService } from './dow-jones.service';

@Module({
  imports: [ConfigModule.forFeature(dowJonesConfig)],
  providers: [DowJonesService, DowJonesApiService],
  exports: [DowJonesService, DowJonesApiService],
})
export class DowJonesModule {}
