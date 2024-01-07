export interface TransactionManager {
  beginTransaction(connection: any): Promise<void>;

  commit(connection: any): Promise<void>;

  rollback(connection: any): Promise<void>;

  release(connection: any): Promise<void>;
}
