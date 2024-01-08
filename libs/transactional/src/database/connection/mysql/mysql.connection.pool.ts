import { Injectable } from '@nestjs/common';
import { ConnectionPool } from '@lib/transactional/database/connection/connection.pool';
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class MysqlConnectionPool implements ConnectionPool {
  private readonly pool: Pool;

  constructor() {
    this.pool = createPool({
      host: 'localhost',
      port: 13306,
      user: 'user',
      password: 'password',
      database: 'tx',
    });
  }

  async closePool(): Promise<void> {
    await this.pool.end();
  }

  async getConnection(): Promise<any> {
    return await this.pool.getConnection();
  }
}
