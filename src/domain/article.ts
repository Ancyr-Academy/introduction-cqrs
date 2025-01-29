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
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class Article {
  @Property({ primary: true })
  public id: string;

  @Exclude()
  @ManyToOne({
    entity: () => User,
    ref: true,
    eager: false,
    deleteRule: 'cascade',
    inversedBy: 'articles',
  })
  public user: Ref<User>;

  @Property()
  public title: string;

  @Property()
  public content: string;

  @Exclude()
  @OneToMany({
    entity: () => Clap,
    mappedBy: 'article',
  })
  public claps = new Collection<Clap>(this);

  @Expose({ name: 'claps' })
  public arrayClaps: Clap[];
}
