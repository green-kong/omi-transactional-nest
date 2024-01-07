import { Inject, Injectable } from '@nestjs/common';
import { ConnectionManager } from '@lib/transactional';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';

@Injectable()
export class ConnectionHolder {
  private static readonly HOLDER_KEY = 'connectionHolder';
  private static readonly CONNECTION_KEY = 'connection';

  constructor(
    @Inject('connectionManager')
    private readonly connectionManager: ConnectionManager,
  ) {}

  getHolder(): Namespace<Record<string, any>> {
    return (
      getNamespace(ConnectionHolder.HOLDER_KEY) ||
      createNamespace(ConnectionHolder.HOLDER_KEY)
    );
  }

  async holdConnection(): Promise<void> {
    const connection = await this.connectionManager.connect();
    const holder = this.getHolder();
    holder.set(ConnectionHolder.CONNECTION_KEY, connection);
  }

  getConnection(): any {
    const holder = this.getHolder();
    return holder.get(ConnectionHolder.CONNECTION_KEY);
  }
}
