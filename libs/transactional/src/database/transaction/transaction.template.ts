import { Inject, Injectable } from '@nestjs/common';
import { TransactionManager } from '@lib/transactional/database/transaction/transaction.manager';
import { ConnectionHolder } from '@lib/transactional/database/connection/connection.holder';

@Injectable()
export class TransactionTemplate {
  constructor(
    @Inject('transactionManager')
    private readonly transactionManager: TransactionManager,
    private readonly connectionHolder: ConnectionHolder,
  ) {}

  async transact<T>(callback: () => Promise<T>): Promise<T> {
    const connection = this.connectionHolder.getConnection();
    await this.transactionManager.beginTransaction(connection);
    try {
      const result = await callback();
      await this.transactionManager.commit(connection);
      return result;
    } catch (error) {
      await this.transactionManager.rollback(connection);
      throw error;
    } finally {
      await this.transactionManager.release(connection);
    }
  }
}
