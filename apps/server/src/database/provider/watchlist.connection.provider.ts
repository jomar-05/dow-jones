import { ConfigType } from '@nestjs/config';
import secomDatabaseConfig from 'config/secomDatabase.config';
import { WATCHLIST_DATABASE } from 'libs/common';
import { DatabaseService } from '../database.service';

const watchlistConnectionProvider = {
  provide: WATCHLIST_DATABASE,
  useFactory: async (dbConfig: ConfigType<typeof secomDatabaseConfig>) => {
    return new DatabaseService(
      dbConfig.host,
      dbConfig.port,
      dbConfig.user,
      dbConfig.password,
      dbConfig.name,
    );
  },
  inject: [secomDatabaseConfig.KEY],
};

export default watchlistConnectionProvider;
