import { Entity, ManyToOne, Property, Ref } from '@mikro-orm/core';
import { Article } from './article';

@Entity()
export class Clap {
  @Property({ primary: true })
  public id: string;

  @ManyToOne({
    entity: () => Article,
    ref: true,
    deleteRule: 'cascade',
    inversedBy: 'claps',
  })
  public article: Ref<Article>;

  @Property()
  public count: number;
}
