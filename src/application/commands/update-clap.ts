import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { Clap } from '../../domain/entity/clap';
import { ClapUpdatedEvent } from '../../domain/events/clap-events';

const schema = z.object({
  id: z.string(),
  count: z.number(),
});

export class UpdateClapCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(UpdateClapCommand)
export class UpdateClapHandler implements ICommandHandler<UpdateClapCommand> {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(command: UpdateClapCommand) {
    const data = schema.parse(command.props);

    const clap = await this.entityManager.findOneOrFail(
      Clap,
      {
        id: data.id,
      },
      {
        populate: ['article', 'article.user'],
      },
    );

    const before = clap.count;
    clap.count = data.count;

    clap.addEvent<ClapUpdatedEvent>('clap.updated', {
      articleId: clap.article.id,
      articleUserId: clap.article.unwrap().user.id,
      before,
      after: clap.count,
      clapId: clap.id,
    });
  }
}
