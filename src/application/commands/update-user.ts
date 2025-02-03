import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entity/user';
import { UserUpdatedEvent } from '../../domain/events/user-events';

const schema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export class UpdateUserCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateUserCommand) {
    const data = schema.parse(command.props);

    const user = await this.entityManager.findOneOrFail(User, {
      id: data.id,
    });

    user.firstName = data.firstName;
    user.lastName = data.lastName;

    this.eventEmitter.emit('user.updated', {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    } as UserUpdatedEvent);
  }
}
