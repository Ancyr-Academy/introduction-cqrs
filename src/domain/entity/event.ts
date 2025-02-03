import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class Event {
  @Property({ primary: true, autoincrement: true })
  public id: number;

  @Property()
  public name: string;

  @Property({ type: 'jsonb' })
  public payload: Record<string, any>;

  @Property({ type: 'datetime' })
  public createdAt: Date;

  @Property({ type: 'datetime', nullable: true })
  public processedAt: Date | null;

  constructor(name: string, payload: Record<string, any>) {
    this.name = name;
    this.payload = payload;
    this.createdAt = new Date();
  }
}
