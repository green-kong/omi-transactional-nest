import { Propagation } from '@lib/transactional/database/transaction/propagation';
import { v4 } from 'uuid';

export class Transaction {
  readonly id: string;
  readonly propagation: Propagation;
  readonly connection: any;

  constructor(propagation: Propagation, connection: any) {
    this.id = v4().split('-').join('');
    this.propagation = propagation;
    this.connection = connection;
  }
}
