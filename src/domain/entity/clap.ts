import { Entity, ManyToOne, Property, Ref } from '@mikro-orm/core';
import { Article } from './article';
import { BaseEntity } from './base-entity';

@Entity()
export class Clap extends BaseEntity {
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
