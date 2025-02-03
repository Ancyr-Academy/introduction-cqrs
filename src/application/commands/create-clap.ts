import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { Article } from '../../domain/entity/article';
import { uuidv7 } from 'uuidv7';
import { Clap } from '../../domain/entity/clap';
import { ClapCreatedEvent } from '../../domain/events/clap-events';

const schema = z.object({
  articleId: z.string(),
  count: z.number(),
});

export class CreateClapCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(CreateClapCommand)
export class CreateClapHandler implements ICommandHandler<CreateClapCommand> {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(command: CreateClapCommand) {
    const data = schema.parse(command.props);

    const article = await this.entityManager.findOneOrFail(Article, {
      id: data.articleId,
    });

    const clap = this.entityManager.create(Clap, {
      id: uuidv7(),
      article: article.id,
      count: data.count,
    });

    clap.addEvent<ClapCreatedEvent>('clap.created', {
      clapId: clap.id,
      articleId: article.id,
      articleUserId: article.user.id,
      clapsCount: clap.count,
    });

    return {
      id: clap.id,
    };
  }
}
