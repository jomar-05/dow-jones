import { ConfigType } from '@nestjs/config';
import secomDatabaseConfig from 'config/secomDatabase.config';
import { SECOM_DATABASE } from 'libs/common';
import { DatabaseService } from '../database.service';

const secomConnectionProvider = {
  provide: SECOM_DATABASE,
  useFactory: async (dbConfig: ConfigType<typeof secomDatabaseConfig>) => {
    return new DatabaseService(
      dbConfig.host || 'localhost',
      dbConfig.port || 3306,
      dbConfig.user || '',
      dbConfig.password || '',
      dbConfig.name || '',
    );
  },
  inject: [secomDatabaseConfig.KEY],
};

export default secomConnectionProvider;
