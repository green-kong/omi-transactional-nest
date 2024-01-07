export interface ConnectionPool {
  getConnection(): Promise<any>;

  closePool(): Promise<void>;
}
