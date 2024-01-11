import { Module } from '@nestjs/common';
import { MysqlConnectionPool } from '@lib/transactional/database/connection/mysql/mysql.connection.pool';
import { MysqlConnectionManager } from '@lib/transactional/database/connection/mysql/mysql.connection.manager';
import { MysqlTransactionManager } from '@lib/transactional/database/transaction/mysql/mysql.transaction.manager';
import { TransactionTemplate } from '@lib/transactional/database/transaction/transaction.template';
import { ConnectionHolder } from '@lib/transactional/database/connection/connection.holder';
import { TransactionalRegister } from '@lib/transactional/decorator/transactional.register';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

@Module({
  providers: [
    { provide: 'connectionPool', useClass: MysqlConnectionPool },
    { provide: 'connectionManager', useClass: MysqlConnectionManager },
    { provide: 'transactionManager', useClass: MysqlTransactionManager },
    { provide: 'transactionTemplate', useClass: TransactionTemplate },
    ConnectionHolder,
    TransactionalRegister,
    DiscoveryService,
    MetadataScanner,
    Reflector,
  ],
  exports: [
    ConnectionHolder,
    { provide: 'connectionPool', useClass: MysqlConnectionPool },
    { provide: 'connectionManager', useClass: MysqlConnectionManager },
    { provide: 'transactionManager', useClass: MysqlTransactionManager },
  ],
})
export class TransactionalModule {}
