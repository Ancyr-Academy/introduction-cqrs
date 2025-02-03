import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { EntityManager } from '@mikro-orm/sqlite';
import { Article } from '../../domain/entity/article';
import { uuidv7 } from 'uuidv7';
import { ArticleCreatedEvent } from '../../domain/events/article-events';

const schema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
});

export class CreateArticleCommand implements ICommand {
  constructor(public readonly props: z.infer<typeof schema>) {}
}

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler
  implements ICommandHandler<CreateArticleCommand>
{
  constructor(private readonly entityManager: EntityManager) {}

  async execute(command: CreateArticleCommand) {
    const data = schema.parse(command.props);

    const article = this.entityManager.create(Article, {
      id: uuidv7(),
      user: data.userId,
      title: data.title,
      content: data.content,
    });

    article.addEvent<ArticleCreatedEvent>('article.created', {
      articleId: article.id,
      userId: article.user.id,
      title: article.title,
      content: article.content,
    });

    return {
      id: article.id,
    };
  }
}
