import { Injectable } from '@nestjs/common';
import { Member } from './member';
import { ConnectionHolder } from '@lib/transactional';
import { FieldPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class MemberRepository {
  constructor(private readonly connectionHolder: ConnectionHolder) {}

  async save(member: Member): Promise<number> {
    const connection = this.connectionHolder.getConnection();
    const sql = 'INSERT INTO member (name) VALUES (?)';
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
      sql,
      [member.name],
    );
    return result.insertId;
  }

  async findById(id: number): Promise<Member> {
    const connection = this.connectionHolder.getConnection();
    const sql = 'select * from member where id = ?';
    const [[result]]: [MemberDataDto[], FieldPacket[]] =
      await connection.execute(sql, [id]);
    return new Member(result.id, result.name);
  }

  async clear() {
    const connection = this.connectionHolder.getConnection();
    const sql = 'truncate member';
    await connection.execute(sql, []);
  }

  async count() {
    const connection = this.connectionHolder.getConnection();
    const sql = 'select * from member';
    const [result]: [MemberDataDto[], FieldPacket[]] = await connection.execute(
      sql,
      [],
    );
    return result.length;
  }
}

interface MemberDataDto {
  id: number;
  name: string;
}
