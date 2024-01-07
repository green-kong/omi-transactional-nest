import { ConnectionManager, TransactionManager } from '@lib/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';

@Injectable()
export class MysqlTransactionManager implements TransactionManager {
  constructor(
    @Inject('connectionManager')
    private readonly connectionManager: ConnectionManager,
  ) {}

  async beginTransaction(connection: PoolConnection): Promise<void> {
    await connection.beginTransaction();
  }

  async commit(connection: PoolConnection): Promise<void> {
    await connection.commit();
  }

  async rollback(connection: PoolConnection): Promise<void> {
    await connection.rollback();
  }

  async release(connection: any): Promise<void> {
    await this.connectionManager.release(connection);
  }
}
