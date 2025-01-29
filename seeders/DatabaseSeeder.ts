import { EntityManager, ref } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../src/domain/user';
import { uuidv7 } from 'uuidv7';
import { Article } from '../src/domain/article';
import { Clap } from '../src/domain/clap';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const sherlockHolmes = em.create(User, {
      id: uuidv7(),
      emailAddress: 'holmes@gmail.com',
      firstName: 'Sherlock',
      lastName: 'Holmes',
    });

    const johnWatson = em.create(User, {
      id: uuidv7(),
      emailAddress: 'watson@gmail.com',
      firstName: 'John',
      lastName: 'Watson',
    });

    const article1 = em.create(Article, {
      id: uuidv7(),
      user: ref(sherlockHolmes),
      title: 'An article',
      content: 'This is the first article',
    });

    const article2 = em.create(Article, {
      id: uuidv7(),
      user: ref(johnWatson),
      title: 'My diary',
      content: 'Our adventures were so fun',
    });

    const article3 = em.create(Article, {
      id: uuidv7(),
      user: ref(johnWatson),
      title: 'The hound of baskerville',
      content: 'So it was just a dog actually',
    });

    em.create(Clap, {
      id: uuidv7(),
      article: ref(article1),
      count: 5,
    });

    em.create(Clap, {
      id: uuidv7(),
      article: ref(article1),
      count: 12,
    });

    em.create(Clap, {
      id: uuidv7(),
      article: ref(article2),
      count: 25,
    });
  }
}
