import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { Article } from './article';

@Entity()
export class User {
  @Property({ primary: true })
  public id: string;

  @Property()
  public emailAddress: string;

  @Property()
  public firstName: string;

  @Property()
  public lastName: string;

  @OneToMany({
    entity: () => Article,
    mappedBy: 'user',
  })
  public articles = new Collection<Article>(this);
}
