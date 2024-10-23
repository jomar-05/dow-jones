import { Injectable } from '@nestjs/common';
import { createPool, Pool, PoolOptions } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  public pool: Pool;

  constructor(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
  ) {
    this.pool = createPool(
      this.createConfig(host, port, user, password, database),
    );
  }
  protected createConfig(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
  ): PoolOptions {
    const dbConfig: PoolOptions = {
      host,
      port,
      user,
      password,
      database,
    };
    return dbConfig;
  }
}
