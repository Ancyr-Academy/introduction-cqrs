import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/sqlite';
import { Article } from '../../domain/entity/article';
import { ArticleDeletedEvent } from '../../domain/events/article-events';

export class DeleteArticleCommand implements ICommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler
  implements ICommandHandler<DeleteArticleCommand>
{
  constructor(private readonly entityManager: EntityManager) {}

  async execute(command: DeleteArticleCommand) {
    const article = await this.entityManager.findOneOrFail(Article, {
      id: command.id,
    });

    const userId = article.user.id;

    article.addEvent<ArticleDeletedEvent>('article.deleted', {
      articleId: article.id,
      userId,
    });
  }
}
