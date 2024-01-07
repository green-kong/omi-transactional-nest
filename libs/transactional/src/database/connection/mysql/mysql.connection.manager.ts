import { ConnectionManager, ConnectionPool } from '@lib/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';

@Injectable()
export class MysqlConnectionManager implements ConnectionManager {
  constructor(
    @Inject('connectionPool')
    private readonly connectionPool: ConnectionPool,
  ) {}

  async connect(): Promise<PoolConnection> {
    return this.connectionPool.getConnection();
  }

  async release(connection: PoolConnection): Promise<void> {
    connection.release();
  }
}
