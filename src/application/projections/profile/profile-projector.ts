import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { UserViewModel } from '../../view-models/user-view-model';
import {
  ClapCreatedEvent,
  ClapDeletedEvent,
  ClapUpdatedEvent,
} from '../../../domain/events/clap-events';
import {
  ArticleCreatedEvent,
  ArticleDeletedEvent,
  ArticleUpdatedEvent,
} from '../../../domain/events/article-events';
import { UserUpdatedEvent } from '../../../domain/events/user-events';
import { RedisService } from '../../../infrastructure/redis-service';

@Injectable()
export class ProfileProjector {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly redis: RedisService,
  ) {}

  async getProjection(userId: string): Promise<UserViewModel> {
    let entry = await this.redis.getJson<UserViewModel>(`user.${userId}`);

    if (!entry) {
      await this.synchronize(userId);
      entry = await this.redis.getJson<UserViewModel>(`user.${userId}`);
    }

    return entry;
  }

  async synchronize(userId: string) {
    const result: Array<{
      userId: string;
      userFirstName: string;
      userLastName: string;
      articleId: string;
      articleTitle: string;
      articleContent: string;
      totalClaps: number;
    }> = await this.entityManager.execute(
      `
      SELECT 
          u.id as userId, 
          u.first_name as userFirstName, 
          u.last_name as userLastName,
          a.id as articleId,
          a.title as articleTitle,
          a.content as articleContent,
          COALESCE(SUM(c.count), 0) AS totalClaps
      FROM "user" AS u
      LEFT JOIN article AS a 
      ON a.user_id = u.id
      LEFT JOIN clap AS c
      ON c.article_id = a.id
      WHERE u.id = ?
      GROUP BY
          a.id, a.title, a.content;
    `,
      [userId],
    );

    const user = result[0];
    const viewModel: UserViewModel = {
      id: user.userId,
      firstName: user.userFirstName,
      lastName: user.userLastName,
      articles: result.map((result) => ({
        id: result.articleId,
        title: result.articleTitle,
        content: result.articleContent,
        clapsCount: result.totalClaps,
      })),
    };

    await this.redis.setJson(`user.${userId}`, viewModel);
  }

  async partialUpdate(
    userId: string,
    apply: (viewModel: UserViewModel) => void,
  ) {
    // TODO : actually make performant atomic JSON.SET calls
    const viewModel = await this.redis.getJson<UserViewModel>(`user.${userId}`);
    if (!viewModel) {
      await this.synchronize(userId);
    }

    apply(viewModel);

    await this.redis.setJson(`user.${userId}`, viewModel);
  }

  async onUserUpdated(event: UserUpdatedEvent) {
    return this.partialUpdate(event.userId, (viewModel) => {
      viewModel.firstName = event.firstName;
      viewModel.lastName = event.lastName;
    });
  }

  async onArticleCreated(event: ArticleCreatedEvent) {
    return this.partialUpdate(event.userId, (viewModel) => {
      // Naive implementation, what if two concurrent updates ?
      viewModel.articles.push({
        id: event.articleId,
        title: event.title,
        content: event.content,
        clapsCount: 0,
      });
    });
  }

  async onArticleUpdated(event: ArticleUpdatedEvent) {
    return this.partialUpdate(event.userId, (viewModel) => {
      const article = viewModel.articles.find(
        (article) => article.id === event.articleId,
      );

      if (article) {
        article.title = event.title;
        article.content = event.content;
      }
    });
  }

  async onArticleDeleted(event: ArticleDeletedEvent) {
    return this.partialUpdate(event.userId, (viewModel) => {
      viewModel.articles = viewModel.articles.filter(
        (article) => article.id !== event.articleId,
      );
    });
  }

  async onClapCreated(event: ClapCreatedEvent) {
    return this.partialUpdate(event.articleUserId, (viewModel) => {
      const article = viewModel.articles.find(
        (article) => article.id === event.articleId,
      );

      if (article) {
        article.clapsCount += event.clapsCount;
      }
    });
  }

  async onClapUpdated(event: ClapUpdatedEvent) {
    return this.partialUpdate(event.articleUserId, (viewModel) => {
      const article = viewModel.articles.find(
        (article) => article.id === event.articleId,
      );

      if (article) {
        const addedClaps = event.after - event.before;
        article.clapsCount += addedClaps;
      }
    });
  }

  async onClapDeleted(event: ClapDeletedEvent) {
    return this.partialUpdate(event.articleUserId, (viewModel) => {
      const article = viewModel.articles.find(
        (article) => article.id === event.articleId,
      );

      if (article) {
        article.clapsCount -= event.clapsCount;
      }
    });
  }
}
