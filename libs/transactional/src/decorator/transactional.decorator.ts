import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Propagation } from '@lib/transactional/database/transaction/propagation';

export const TRANSACTIONAL = Symbol('TRANSACTIONAL');

export type TransactionalOption = {
  propagation: Propagation;
};

export const Transactional = (options?: TransactionalOption) => {
  if (!options) {
    options = { propagation: Propagation.REQUIRED };
  }
  return applyDecorators(
    SetMetadata<symbol, TransactionalOption>(TRANSACTIONAL, options),
  );
};
