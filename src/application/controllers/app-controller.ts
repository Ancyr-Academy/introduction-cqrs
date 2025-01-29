import { Controller, Get } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';

@Controller()
export class AppController {
  constructor(private readonly entityManager: EntityManager) {}

  @Get()
  getHello() {
    return {};
  }
}
