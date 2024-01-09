import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  async getHello(): Promise<{ id: number }> {
    const savedId = await this.apiService.saveMember('test');
    return { id: savedId };
  }
}
