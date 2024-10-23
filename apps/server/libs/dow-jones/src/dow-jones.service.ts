import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import dowJonesConfig from '../../../config/dowJonesConfig';
import { DowJonesRiskEntityDto } from '../dto';
import { NameDTO } from '../dto/name.dto';
import { castDowJonesSearchResponse } from '../helper/castDowJonesSearch';
import { RISK_ENTITY_ROUTES } from '../routes';
import { DowJonesApiService } from './dow-jones-api.service';

@Injectable()
export class DowJonesService {
  constructor(
    @Inject(dowJonesConfig.KEY)
    private readonly config: ConfigType<typeof dowJonesConfig>,
    private readonly dowjonesApi: DowJonesApiService,
  ) {}

  public async dowJonesSearchWatchlistApi(
    data: NameDTO,
  ): Promise<DowJonesRiskEntityDto[] | any> {
    const fixedOffSet = 0;
    const fixedLimit = 10;

    const requestPayload = {
      data: {
        type: 'RiskEntitySearch',
        attributes: {
          paging: {
            offset: this.config.pageOffset || fixedOffSet,
            limit: this.config.pageLimit || fixedLimit,
          },
          sort: 'Name',
          filter_group_and: {
            filters: {
              content_set: ['WatchList'],
              record_types: ['Person'],
              person_name: {
                first_name: data.firstName,
                middle_name: data?.middleName,
                last_name: data.lastName,
                search_type: 'Precise',
              },
              country_territory: {
                countries_territories: {
                  codes: ['PHLNS'],
                },
              },
            },
            group_operator: 'And',
          },
        },
      },
    };

    const resp = await this.dowjonesApi.sendRequest({
      url: RISK_ENTITY_ROUTES.SEARCH,
      method: 'POST',
      data: requestPayload,
    });

    return castDowJonesSearchResponse(resp);
  }
}
