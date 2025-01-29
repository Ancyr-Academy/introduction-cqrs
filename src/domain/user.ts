import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { Exclude, Expose } from 'class-transformer';
import { Article } from './article';

@Entity()
export class User {
  @Property({ primary: true })
  public id: string;

  @Exclude()
  @Property()
  public emailAddress: string;

  @Property()
  public firstName: string;

  @Property()
  public lastName: string;

  @Exclude()
  @OneToMany({
    entity: () => Article,
    mappedBy: 'user',
  })
  public articles = new Collection<Article>(this);

  @Expose({ name: 'articles' })
  public arrayArticles: Article[];
}
