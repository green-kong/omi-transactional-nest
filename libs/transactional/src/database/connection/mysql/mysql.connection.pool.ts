import { ConnectionPool } from '@lib/transactional/database/connection/connection.pool';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MysqlConnectionPool implements ConnectionPool {
  private readonly pool: Pool;

  constructor() {
    this.pool = createPool({
      host: 'localhost',
      port: 13306,
      user: 'user',
      password: 'password',
      database: 'transactional',
    });
  }

  async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  async closePool(): Promise<void> {
    await this.pool.end();
  }
}
