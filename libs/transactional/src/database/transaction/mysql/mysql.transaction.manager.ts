import {
  ConnectionManager,
  TransactionalOption,
  TransactionManager,
} from '@lib/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';
import { Transaction } from '@lib/transactional/database/transaction/transaction';
import { Propagation } from '@lib/transactional/database/transaction/propagation';

@Injectable()
export class MysqlTransactionManager implements TransactionManager {
  private readonly transactions: Transaction[] = [];

  constructor(
    @Inject('connectionManager')
    private readonly connectionManager: ConnectionManager,
  ) {}

  async beginTransaction(
    transactionOption: TransactionalOption,
    connection: PoolConnection,
  ): Promise<void> {
    await connection.beginTransaction();
    const transaction = new Transaction(
      transactionOption.propagation,
      connection,
    );
    this.transactions.push(transaction);
  }

  async commit(connection: PoolConnection): Promise<void> {
    await connection.commit();
  }

  async rollback(connection: PoolConnection): Promise<void> {
    await connection.rollback();
  }

  async release(connection: any): Promise<void> {
    await this.connectionManager.release(connection);
    this.transactions.pop();
  }

  existsCurrentTransaction(): boolean {
    return !!this.transactions.length;
  }

  getCurrentTransactionPropagation(): Propagation {
    return this.transactions[this.transactions.length - 1].propagation;
  }
}
