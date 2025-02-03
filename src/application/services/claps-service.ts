import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';

import { EntityManager } from '@mikro-orm/sqlite';
import { Clap } from '../../domain/entity/clap';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ClapCreatedEvent,
  ClapDeletedEvent,
  ClapUpdatedEvent,
} from '../../domain/events/clap-events';
import { Article } from '../../domain/entity/article';

const createClapsSchema = z.object({
  articleId: z.string(),
  count: z.number(),
});

const updateClapsSchema = z.object({
  count: z.number(),
});

@Injectable()
export class ClapsService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createClap(body: z.infer<typeof createClapsSchema>) {
    const data = createClapsSchema.parse(body);

    const article = await this.entityManager.findOneOrFail(Article, {
      id: body.articleId,
    });

    const clap = this.entityManager.create(Clap, {
      id: uuidv7(),
      article: article.id,
      count: data.count,
    });

    await this.entityManager.flush();

    this.eventEmitter.emit('clap.created', {
      clapId: clap.id,
      articleId: article.id,
      articleUserId: article.user.id,
      clapsCount: clap.count,
    } as ClapCreatedEvent);

    return {
      id: clap.id,
    };
  }

  async updateClap(id: string, body: z.infer<typeof updateClapsSchema>) {
    const data = updateClapsSchema.parse(body);

    const clap = await this.entityManager.findOneOrFail(
      Clap,
      {
        id,
      },
      {
        populate: ['article', 'article.user'],
      },
    );

    const before = clap.count;
    clap.count = data.count;

    await this.entityManager.flush();

    this.eventEmitter.emit('clap.updated', {
      articleId: clap.article.id,
      articleUserId: clap.article.unwrap().user.id,
      before,
      after: clap.count,
      clapId: clap.id,
    } as ClapUpdatedEvent);
  }

  async deleteClap(id: string) {
    const clap = await this.entityManager.findOneOrFail(
      Clap,
      {
        id,
      },
      {
        populate: ['article', 'article.user'],
      },
    );

    const articleId = clap.article.id;
    const articleUserId = clap.article.unwrap().user.id;
    const clapsCount = clap.count;

    this.entityManager.remove(clap);
    await this.entityManager.flush();

    this.eventEmitter.emit('clap.deleted', {
      articleId,
      articleUserId,
      clapsCount,
    } as ClapDeletedEvent);
  }
}
