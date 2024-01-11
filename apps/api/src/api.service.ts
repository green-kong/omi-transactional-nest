import { Injectable } from '@nestjs/common';
import { Transactional } from '@lib/transactional';
import { Member } from './entity/member';
import { MemberRepository } from './entity/member.repository';
import { Propagation } from '@lib/transactional/database/transaction/propagation';

@Injectable()
export class ApiService {
  constructor(private readonly memberRepository: MemberRepository) {}

  @Transactional()
  async saveMember(name: string): Promise<number> {
    const member = Member.from(name);
    return await this.memberRepository.save(member);
  }

  @Transactional()
  async saveMemberThrow(name: string): Promise<number> {
    const member = Member.from(name);
    await this.memberRepository.save(member);
    throw Error();
  }

  @Transactional()
  async nestedRequiredTransaction(name1: string, name2): Promise<number[]> {
    const member = Member.from(name1);
    const savedId1 = await this.memberRepository.save(member);
    const savedId2 = await this.saveMember(name2);
    return [savedId1, savedId2];
  }

  @Transactional()
  async nestedRequiredRollbackTransaction(
    name1: string,
    name2,
  ): Promise<number[]> {
    const member = Member.from(name1);
    const savedId1 = await this.memberRepository.save(member);
    const savedId2 = await this.saveMemberThrow(name2);
    return [savedId1, savedId2];
  }

  @Transactional()
  async nestedRequiresNewTransactionSuccess(name1: string, name2: string) {
    const savedId1 = await this.memberRepository.save(Member.from(name1));
    const savedId2 = await this.requiresNewTransactionSuccess(name2);
    return [savedId1, savedId2];
  }

  @Transactional({ propagation: Propagation.REQUIRES_NEW })
  async requiresNewTransactionSuccess(name: string) {
    return await this.memberRepository.save(Member.from(name));
  }

  @Transactional()
  async nestedRequiresNewTransactionChildFail(name1: string, name2: string) {
    const savedId1 = await this.memberRepository.save(Member.from(name1));
    const savedId2 = await this.requiresNewTransactionFail(name2);
    return [savedId1, savedId2];
  }

  @Transactional({ propagation: Propagation.REQUIRES_NEW })
  private async requiresNewTransactionFail(name: string) {
    const savedId = await this.memberRepository.save(Member.from(name));
    throw new Error();
  }

  @Transactional()
  async nestedRequiresNewTransactionParentFail(name1: string, name2: string) {
    const savedId1 = await this.memberRepository.save(Member.from(name1));
    const savedId2 = await this.requiresNewTransactionSuccess(name2);
    throw new Error();
    return [savedId1, savedId2];
  }
}
