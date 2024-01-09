import { Injectable } from '@nestjs/common';
import { Transactional } from '@lib/transactional';
import { Member } from './entity/member';
import { MemberRepository } from './entity/member.repository';

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
}
