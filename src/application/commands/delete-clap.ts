import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/sqlite';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Clap } from '../../domain/entity/clap';
import { ClapDeletedEvent } from '../../domain/events/clap-events';

export class DeleteClapCommand implements ICommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteClapCommand)
export class DeleteClapHandler implements ICommandHandler<DeleteClapCommand> {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: DeleteClapCommand) {
    const clap = await this.entityManager.findOneOrFail(
      Clap,
      {
        id: command.id,
      },
      {
        populate: ['article', 'article.user'],
      },
    );

    const articleId = clap.article.id;
    const articleUserId = clap.article.unwrap().user.id;
    const clapsCount = clap.count;

    this.entityManager.remove(clap);

    this.eventEmitter.emit('clap.deleted', {
      articleId,
      articleUserId,
      clapsCount,
    } as ClapDeletedEvent);
  }
}
