import { ConfigType } from '@nestjs/config';
import dowJonesConfig from 'config/dowJonesConfig';
import { DOW_JONES_API } from 'libs/common';

const dowjonesConnectionProvider = {
  provide: DOW_JONES_API,
  useFactory: async (dbConfig: ConfigType<typeof dowJonesConfig>) => {
    // Ensure to destructure the dbConfig object to access its properties
    const { host, port, user, password, name } = dbConfig;

    return {
      host,
      port,
      user,
      password,
      name,
    };
  },
  inject: [dowJonesConfig.KEY],
};

export default dowjonesConnectionProvider;
