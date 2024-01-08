import { applyDecorators, SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL = Symbol('TRANSACTIONAL');

export type TransactionalOption =
  | { propagation: true; transactionName: string }
  | { propagation: false };

export const Transactional = (options?: TransactionalOption) => {
  if (!options) {
    options = { propagation: false };
  }
  return applyDecorators(
    SetMetadata<symbol, TransactionalOption>(TRANSACTIONAL, options),
  );
};
