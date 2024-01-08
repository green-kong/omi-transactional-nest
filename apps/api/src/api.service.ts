import { Injectable } from '@nestjs/common';
import { Transactional } from '@lib/transactional';

@Injectable()
export class ApiService {
  @Transactional()
  getHello(): string {
    return 'Hello World!';
  }
}
