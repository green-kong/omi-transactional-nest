import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { MemberRepository } from './entity/member.repository';
import {
  ConnectionHolder,
  ConnectionPool,
  TransactionalModule,
} from '@lib/transactional';

describe('transaction test', () => {
  let service: ApiService;
  let connectionHolder: ConnectionHolder;
  let repository: MemberRepository;
  let pool: ConnectionPool;

  beforeAll(async () => {
    // 테스트하기전에 실행
    const module: TestingModule = await Test.createTestingModule({
      imports: [TransactionalModule],
      providers: [ApiService, MemberRepository],
    }).compile();

    service = module.get(ApiService);
    connectionHolder = module.get(ConnectionHolder);
    repository = module.get(MemberRepository);
    pool = module.get('connectionPool');

    // onModuleInit 돌릴려면 실행해야함.
    await module.init();
  });

  afterAll(async () => {
    await pool.closePool();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(connectionHolder).toBeDefined();
  });

  it('commit 테스트', async () => {
    const holder = connectionHolder.getHolder();
    await holder.runAndReturn(async () => {
      await connectionHolder.holdConnection();

      // given
      const name = 'test';

      // when
      const savedId = await service.saveMember(name);
      const member = await repository.findById(savedId);

      // then
      expect(member.id).toEqual(savedId);
      expect(member.name).toEqual(name);
    });
  });

  it('rollback 테스트', async () => {
    const holder = connectionHolder.getHolder();
    await holder.runAndReturn(async () => {
      await connectionHolder.holdConnection();

      // given
      await repository.clear();
      const beforeCount = await repository.count();
      const name = 'asdfasdf';

      // when
      await expect(service.saveMemberThrow(name)).rejects.toThrow(new Error());
      const afterCount = await repository.count();

      // then
      expect(beforeCount).toEqual(afterCount);
    });
  });

  describe('기존 트랜잭션 존재 : O, propagation: REQUIRED 테스트', () => {
    it('commit 테스트', async () => {
      const holder = connectionHolder.getHolder();
      await holder.runAndReturn(async () => {
        await connectionHolder.holdConnection();

        // given
        await repository.clear();
        const beforeCount = await repository.count();
        const name1 = 'test1';
        const name2 = 'test2';

        // when
        await service.nestedRequiredTransaction(name1, name2);
        const afterCount = await repository.count();

        // then
        expect(afterCount).toEqual(beforeCount + 2);
      });
    });

    it('rollback 테스트', async () => {
      const holder = connectionHolder.getHolder();
      await holder.runAndReturn(async () => {
        await connectionHolder.holdConnection();

        // given
        await repository.clear();
        const beforeCount = await repository.count();
        const name1 = 'test1';
        const name2 = 'test2';

        // when
        await expect(
          service.nestedRequiredRollbackTransaction(name1, name2),
        ).rejects.toThrow(new Error());
        const afterCount = await repository.count();

        // then
        expect(afterCount).toEqual(beforeCount);
      });
    });
  });

  describe('기존 트랜잭션 존재 : O, propagation: REQUIRES_NEW 테스트', () => {
    it('commit test', async () => {
      const holder = connectionHolder.getHolder();
      await holder.runAndReturn(async () => {
        await connectionHolder.holdConnection();

        // given
        await repository.clear();
        const beforeCount = await repository.count();
        const name1 = 'test1';
        const name2 = 'test2';

        // when
        const ids = await service.nestedRequiresNewTransactionSuccess(
          name1,
          name2,
        );
        const afterCount = await repository.count();

        // then
        expect(afterCount).toEqual(beforeCount + 2);
      });
    });

    it('child transaction rollback test', async () => {
      const holder = connectionHolder.getHolder();
      await holder.runAndReturn(async () => {
        await connectionHolder.holdConnection();

        // given
        await repository.clear();
        const beforeCount = await repository.count();
        const name1 = 'test1';
        const name2 = 'test2';

        // when
        await service.nestedRequiresNewTransactionChildFail(name1, name2);
        const afterCount = await repository.count();
        const member1 = await repository.findById(1);
        const member2 = await repository.findById(2);

        // then
        expect(afterCount).toEqual(beforeCount + 1);
        expect(member1.name).toEqual(name1);
        expect(member2).toBeNull();
      });
    });

    it('parent transaction rollback test', async () => {
      const holder = connectionHolder.getHolder();
      await holder.runAndReturn(async () => {
        await connectionHolder.holdConnection();

        // given
        await repository.clear();
        const beforeCount = await repository.count();
        const name1 = 'test1';
        const name2 = 'test2';

        // when
        await expect(
          service.nestedRequiresNewTransactionParentFail(name1, name2),
        ).rejects.toThrow();
        const afterCount = await repository.count();
        const member1 = await repository.findById(1);
        const member2 = await repository.findById(2);

        // then
        expect(afterCount).toEqual(beforeCount + 1);
        expect(member1).toBeNull();
        expect(member2.name).toEqual(name2);
      });
    });
  });
});
