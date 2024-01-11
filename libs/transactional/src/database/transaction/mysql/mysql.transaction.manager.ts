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
  ): Promise<any> {
    await connection.beginTransaction();
    const transaction = new Transaction(
      transactionOption.propagation,
      connection,
    );
    this.transactions.push(transaction);
    return transaction;
  }

  async commit(transaction: Transaction): Promise<void> {
    const connection = transaction.connection;
    await connection.commit();
  }

  async rollback(transaction: Transaction): Promise<void> {
    const connection = transaction.connection;
    await connection.rollback();
  }

  async release(transaction: Transaction): Promise<void> {
    const connection = transaction.connection;
    await this.connectionManager.release(connection);
    this.transactions.pop();
  }

  existsCurrentTransaction(): boolean {
    return !!this.transactions.length;
  }

  getCurrentTransactionPropagation(): Propagation {
    return this.transactions[this.transactions.length - 1].propagation;
  }

  getCurrentTransactionConnection(): any {
    return this.transactions[this.transactions.length - 1].connection;
  }
}
