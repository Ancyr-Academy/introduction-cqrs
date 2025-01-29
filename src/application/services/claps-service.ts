import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';

import { EntityManager } from '@mikro-orm/sqlite';
import { Clap } from '../../domain/clap';

const createClapsSchema = z.object({
  articleId: z.string(),
  count: z.number(),
});

const updateClapsSchema = z.object({
  count: z.number(),
});

@Injectable()
export class ClapsService {
  constructor(private readonly entityManager: EntityManager) {}

  async createClap(body: z.infer<typeof createClapsSchema>) {
    const data = createClapsSchema.parse(body);

    const clap = this.entityManager.create(Clap, {
      id: uuidv7(),
      article: body.articleId,
      count: body.count,
    });

    await this.entityManager.flush();

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
  }

  async deleteClap(id: string) {
    const clap = await this.entityManager.findOneOrFail(Clap, {
      id,
    });

    this.entityManager.remove(clap);
    await this.entityManager.flush();
  }
}
