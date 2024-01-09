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
});
