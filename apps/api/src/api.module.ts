import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConnectionMiddleware, TransactionalModule } from '@lib/transactional';
import { MemberRepository } from './entity/member.repository';

@Module({
  imports: [TransactionalModule],
  controllers: [ApiController],
  providers: [ApiService, MemberRepository],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(ConnectionMiddleware).forRoutes('*');
  }
}
