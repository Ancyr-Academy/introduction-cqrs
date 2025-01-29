import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';
import { EntityManager } from '@mikro-orm/sqlite';
import { User } from '../../domain/user';
import { Article } from '../../domain/article';
import { Clap } from '../../domain/clap';

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

@Injectable()
export class UserService {
  constructor(private readonly entityManager: EntityManager) {}

  async createUser(body: z.infer<typeof userSchema>) {
    const data = userSchema.parse(body);

    const user = this.entityManager.create(User, {
      id: uuidv7(),
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await this.entityManager.flush();

    return {
      id: user.id,
    };
  }

  async updateUser(id: string, body: z.infer<typeof userSchema>) {
    const data = userSchema.parse(body);

    const user = await this.entityManager.findOneOrFail(User, {
      id,
    });

    user.firstName = data.firstName;
    user.lastName = data.lastName;

    await this.entityManager.flush();
  }

  async getUser(id: string) {
    const user = await this.entityManager.findOneOrFail(User, {
      id,
    });

    user.arrayArticles = await this.entityManager.find(
      Article,
      {
        user,
      },
      {
        populate: ['claps'],
      },
    );

    user.arrayArticles.forEach((article) => {
      article.arrayClaps = article.claps.toArray() as unknown as Clap[];
    });

    return user;
  }
}
