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

    const clap = this.entityManager.create(Clap, {
      id: uuidv7(),
      article: body.articleId,
      count: body.count,
    });

    await this.entityManager.flush();

    this.eventEmitter.emit('clap.created', {
      clapId: clap.id,
    } as ClapCreatedEvent);

    return {
      id: clap.id,
    };
  }

  async updateClap(id: string, body: z.infer<typeof updateClapsSchema>) {
    const data = updateClapsSchema.parse(body);

    const clap = await this.entityManager.findOneOrFail(Clap, {
      id,
    });

    clap.count = body.count;

    await this.entityManager.flush();

    this.eventEmitter.emit('clap.updated', {
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
        populate: ['article'],
      },
    );

    const articleId = clap.article.id;

    this.entityManager.remove(clap);
    await this.entityManager.flush();

    this.eventEmitter.emit('clap.deleted', {
      articleId,
    } as ClapDeletedEvent);
  }
}
