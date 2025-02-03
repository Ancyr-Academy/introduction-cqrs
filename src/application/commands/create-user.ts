import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { uuidv7 } from 'uuidv7';
import { User } from '../../domain/entity/user';
import { UserCreatedEvent } from '../../domain/events/user-events';

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export class CreateUserCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateUserCommand) {
    const data = schema.parse(command.props);

    const user = this.entityManager.create(User, {
      id: uuidv7(),
      firstName: data.firstName,
      lastName: data.lastName,
    });

    this.eventEmitter.emit('user.created', {
      userId: user.id,
    } as UserCreatedEvent);

    return {
      id: user.id,
    };
  }
}
