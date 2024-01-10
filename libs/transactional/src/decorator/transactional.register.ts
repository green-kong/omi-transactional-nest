import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import {
  TransactionTemplate,
  TRANSACTIONAL,
  TransactionalOption,
} from '@lib/transactional';

@Injectable()
export class TransactionalRegister implements OnModuleInit {
  constructor(
    private readonly discoverService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @Inject('transactionTemplate')
    private readonly transactionTemplate: TransactionTemplate,
  ) {}

  onModuleInit(): any {
    return this.discoverService
      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic()) // scope가 싱글톤인것만 (request scope의 porvider는 거름
      .filter(({ instance }) => instance && Object.getPrototypeOf(instance)) // 인스턴스가 존재하는 것, 그리고 프로토타입이 있는 프로바이더만 필터링(클래스기반 프로바이더만 가져옴)
      .forEach(({ instance }) => {
        const methodNames = this.metadataScanner.getAllMethodNames(
          Object.getPrototypeOf(instance),
        );
        methodNames.forEach((methodName) => {
          const transactionalOption = this.reflector.get<
            TransactionalOption,
            symbol
          >(TRANSACTIONAL, instance[methodName]);
          if (!transactionalOption) {
            return;
          }
          const originalMethod = instance[methodName];

          instance[methodName] = async (...args: any[]) => {
            return this.transactionTemplate.transact(transactionalOption, () =>
              originalMethod.apply(instance, args),
            );
          };
        });
      });
  }
}
