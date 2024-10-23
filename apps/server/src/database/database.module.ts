// src/modules/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import secomDatabaseConfig from 'config/secomDatabase.config';
import { Watchlist } from './entities/dowjones-watchlist.entity';
import { Users } from './entities/user.entity';
import secomConnectionProvider from './provider/secom.connection.provider';

@Module({
  imports: [
    ConfigModule.forFeature(secomDatabaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = await configService.get('secomDatabase');
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [Users, Watchlist], // Include both Users and Watchlist entities
          synchronize: true, // Set to false in production
        };
      },
    }),
  ],
  providers: [secomConnectionProvider],
  exports: [secomConnectionProvider],
})
export class DatabaseModule {}
