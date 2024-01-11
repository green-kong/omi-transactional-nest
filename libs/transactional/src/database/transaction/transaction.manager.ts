import { TransactionalOption } from '@lib/transactional/decorator/transactional.decorator';
import { Propagation } from '@lib/transactional/database/transaction/propagation';

export interface TransactionManager {
  beginTransaction(
    transactionOption: TransactionalOption,
    connection: any,
  ): Promise<any>;

  commit(connection: any): Promise<void>;

  rollback(connection: any): Promise<void>;

  release(connection: any): Promise<void>;

  existsCurrentTransaction(): boolean;

  getCurrentTransactionPropagation(): Propagation;

  getCurrentTransactionConnection(): any;
}
