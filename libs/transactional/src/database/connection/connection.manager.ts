export interface ConnectionManager {
  connect(): Promise<any>;

  release(connection: any): Promise<void>;
}
