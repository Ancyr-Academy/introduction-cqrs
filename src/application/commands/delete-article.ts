import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/sqlite';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Article } from '../../domain/entity/article';
import { ArticleDeletedEvent } from '../../domain/events/article-events';

export class DeleteArticleCommand implements ICommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler
  implements ICommandHandler<DeleteArticleCommand>
{
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: DeleteArticleCommand) {
    const article = await this.entityManager.findOneOrFail(Article, {
      id: command.id,
    });

    const userId = article.user.id;

    this.entityManager.remove(article);

    this.eventEmitter.emit('article.deleted', {
      articleId: article.id,
      userId,
    } as ArticleDeletedEvent);
  }
}
