import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/sqlite';
import { Clap } from '../../domain/entity/clap';
import { ClapDeletedEvent } from '../../domain/events/clap-events';

export class DeleteClapCommand implements ICommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteClapCommand)
export class DeleteClapHandler implements ICommandHandler<DeleteClapCommand> {
  constructor(private readonly entityManager: EntityManager) {}

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

    clap.addEvent<ClapDeletedEvent>('clap.deleted', {
      articleId: clap.article.id,
      articleUserId: clap.article.unwrap().user.id,
      clapsCount: clap.count,
    });

    this.entityManager.remove(clap);
  }
}
