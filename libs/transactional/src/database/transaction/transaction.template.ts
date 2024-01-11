import { Inject, Injectable } from '@nestjs/common';
import { TransactionManager } from '@lib/transactional/database/transaction/transaction.manager';
import { ConnectionHolder } from '@lib/transactional/database/connection/connection.holder';
import { TransactionalOption } from '@lib/transactional/decorator/transactional.decorator';
import { Propagation } from '@lib/transactional/database/transaction/propagation';
import { ConnectionManager } from '@lib/transactional/database/connection/connection.manager';

@Injectable()
export class TransactionTemplate {
  constructor(
    @Inject('transactionManager')
    private readonly transactionManager: TransactionManager,
    @Inject('connectionManager')
    private readonly connectionManager: ConnectionManager,
    private readonly connectionHolder: ConnectionHolder,
  ) {}

  async transact<T>(
    transactionOption: TransactionalOption,
    callback: () => Promise<T>,
  ): Promise<T> {
    // case 1: 기존 트랜잭션 x, 새로운 트랜잭션 propagation: required
    // => 새로운 트랜잭션 시작, holder에 저장되어 있는 커넥션으로 새로운 트랜잭션 이용
    // case 2: 기존 트랜잭션 x, 새로운 트랜잭션 propagation: requires new
    // => 새로운 트랜잭션 시작, holder에 저장되어 있는 커넥션으로 새로운 트랜잭션 이용
    // case 3: 기존 트랜잭션 o, 새로운 트랜잭션 propagation: required
    // => 기존 트랜잭션의 커넥션 이용
    // case 4: 기존 트랜잭션 o, 새로운 트랜잭션 propagation: requires new
    // => 새로운 트랜잭션 시작, 새로운 커넥션 이용

    // 기존 트랜잭션이 있는 경우
    if (this.transactionManager.existsCurrentTransaction()) {
      // required
      if (transactionOption.propagation === Propagation.REQUIRED) {
        return await callback();
      }
      // requires new
      if (transactionOption.propagation === Propagation.REQUIRES_NEW) {
        // 새로운 커넥션
        const connection = await this.connectionManager.connect();
        const transaction = await this.transactionManager.beginTransaction(
          transactionOption,
          connection,
        );
        try {
          const result = await callback();
          await this.transactionManager.commit(transaction);
          return result;
        } catch (error) {
          await this.transactionManager.rollback(transaction);
        } finally {
          await this.transactionManager.release(transaction);
        }
      }
    } else {
      // 기존트랜잭션 없는 경우
      const connection = await this.connectionHolder.getConnection();
      const transaction = await this.transactionManager.beginTransaction(
        transactionOption,
        connection,
      );
      return await this.runCallbackInTemplate(callback, transaction);
    }
  }

  private async runCallbackInTemplate<T>(
    callback: () => Promise<T>,
    connection,
  ) {
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
