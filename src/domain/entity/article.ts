import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
} from '@mikro-orm/core';
import { User } from './user';
import { Clap } from './clap';
import { BaseEntity } from './base-entity';

@Entity()
export class Article extends BaseEntity {
  @Property({ primary: true })
  public id: string;

  @ManyToOne({
    entity: () => User,
    ref: true,
    deleteRule: 'cascade',
    inversedBy: 'articles',
  })
  public user: Ref<User>;

  @Property()
  public title: string;

  @Property()
  public content: string;

  @OneToMany({
    entity: () => Clap,
    mappedBy: 'article',
    lazy: true,
  })
  public claps = new Collection<Clap>(this);
}
