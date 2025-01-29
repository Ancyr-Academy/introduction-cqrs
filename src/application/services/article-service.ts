import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';

import { EntityManager } from '@mikro-orm/sqlite';
import { Article } from '../../domain/entity/article';
import { UserProfileProjector } from './user-profile-projector.service';

const createPostSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
});

const updatePostSchema = z.object({
  title: z.string(),
  content: z.string(),
});

@Injectable()
export class ArticleService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly projector: UserProfileProjector,
  ) {}

  async createArticle(body: z.infer<typeof createPostSchema>) {
    const data = createPostSchema.parse(body);

    const article = this.entityManager.create(Article, {
      id: uuidv7(),
      user: body.userId,
      title: body.title,
      content: body.content,
    });

    await this.entityManager.flush();
    await this.projector.synchronize(body.userId);

    return {
      id: article.id,
    };
  }

  async updateArticle(id: string, body: z.infer<typeof updatePostSchema>) {
    const data = updatePostSchema.parse(body);

    const article = await this.entityManager.findOneOrFail(Article, {
      id,
    });

    article.title = data.title;
    article.content = data.content;

    await this.entityManager.flush();
    await this.projector.synchronize(article.user.id);
  }

  async deleteArticle(id: string) {
    const article = await this.entityManager.findOneOrFail(Article, {
      id,
    });

    this.entityManager.remove(article);
    await this.entityManager.flush();

    await this.projector.synchronize(article.user.id);
  }
}
