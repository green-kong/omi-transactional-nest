import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConnectionHolder } from '@lib/transactional';

@Injectable()
export class ConnectionMiddleware implements NestMiddleware {
  constructor(private readonly connectionHolder: ConnectionHolder) {}

  use(req: any, res: any, next: () => void) {
    const holder = this.connectionHolder.getHolder();
    return holder.runAndReturn(async () => {
      await this.connectionHolder.holdConnection();
      next();
    });
  }
}
