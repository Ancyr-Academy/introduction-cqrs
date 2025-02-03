import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/sqlite';

@Injectable()
export class AppCommandBus {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly entityManager: EntityManager,
  ) {}

  async execute<T>(command: ICommand): Promise<T> {
    const result = await this.commandBus.execute(command);
    await this.entityManager.flush();

    return result;
  }
}
