import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { UserViewModel } from '../view-models/user-view-model';
import { UserProfileView } from '../../domain/views/user-profile-view';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ClapCreatedEvent,
  ClapDeletedEvent,
  ClapUpdatedEvent,
} from '../../domain/events/clap-events';
import { Clap } from '../../domain/entity/clap';
import { Article } from '../../domain/entity/article';
import {
  ArticleCreatedEvent,
  ArticleDeletedEvent,
  ArticleUpdatedEvent,
} from '../../domain/events/article-events';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
} from '../../domain/events/user-events';

@Injectable()
export class UserProfileProjector {
  constructor(private readonly entityManager: EntityManager) {}

  async getProjection(userId: string): Promise<UserViewModel> {
    let entry = await this.entityManager.findOne(UserProfileView, {
      id: userId,
    });

    if (!entry) {
      await this.synchronize(userId);

      entry = await this.entityManager.findOneOrFail(UserProfileView, {
        id: userId,
      });
    }

    return entry.content;
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

    await this.entityManager.upsert(UserProfileView, {
      id: user.userId,
      content: viewModel,
    });

    await this.entityManager.flush();
  }

  @OnEvent('user.created', { async: true })
  async onUserCreated(event: UserCreatedEvent) {
    return this.synchronize(event.userId);
  }

  @OnEvent('user.updated', { async: true })
  async onUserUpdated(event: UserUpdatedEvent) {
    return this.synchronize(event.userId);
  }

  @OnEvent('article.created', { async: true })
  async onArticleCreated(event: ArticleCreatedEvent) {
    return this.synchronizeFromArticle(event.articleId);
  }

  @OnEvent('article.updated', { async: true })
  async onArticleUpdated(event: ArticleUpdatedEvent) {
    return this.synchronizeFromArticle(event.articleId);
  }

  @OnEvent('article.deleted', { async: true })
  async onArticleDeleted(event: ArticleDeletedEvent) {
    return this.synchronize(event.userId);
  }

  @OnEvent('clap.created', { async: true })
  async onClapCreated(event: ClapCreatedEvent) {
    return this.synchronizeFromClap(event.clapId);
  }

  @OnEvent('clap.updated', { async: true })
  async onClapUpdated(event: ClapUpdatedEvent) {
    return this.synchronizeFromClap(event.clapId);
  }

  @OnEvent('clap.deleted', { async: true })
  async onClapDeleted(event: ClapDeletedEvent) {
    return this.synchronizeFromArticle(event.articleId);
  }

  private async synchronizeFromClap(clapId: string) {
    const clap = await this.entityManager.findOne(
      Clap,
      {
        id: clapId,
      },
      {
        populate: ['article', 'article.user'],
      },
    );

    return this.synchronize(clap.article.unwrap().user.id);
  }

  private async synchronizeFromArticle(articleId: string) {
    const article = await this.entityManager.findOne(
      Article,
      {
        id: articleId,
      },
      {
        populate: ['user'],
      },
    );

    return this.synchronize(article.user.id);
  }
}
