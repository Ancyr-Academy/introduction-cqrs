import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Article } from '../../domain/entity/article';
import { ArticleUpdatedEvent } from '../../domain/events/article-events';

const schema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export class UpdateArticleCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler
  implements ICommandHandler<UpdateArticleCommand>
{
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateArticleCommand) {
    const data = schema.parse(command.props);

    const article = await this.entityManager.findOneOrFail(Article, {
      id: data.id,
    });

    article.title = data.title;
    article.content = data.content;

    await this.entityManager.flush();

    this.eventEmitter.emit('article.updated', {
      articleId: article.id,
      userId: article.user.id,
      title: article.title,
      content: article.content,
    } as ArticleUpdatedEvent);
  }
}
