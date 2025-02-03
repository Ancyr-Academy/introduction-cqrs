import { FlushEventArgs } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { BaseEntity } from '../domain/entity/base-entity';
import { Event } from '../domain/entity/event';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TransactionalEventSubscriber {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {
    entityManager.getEventManager().registerSubscriber(this);
  }

  async beforeFlush<T>(args: FlushEventArgs): Promise<void> {
    // Not computed at this stage, forcefully computes it
    args.uow.computeChangeSets();

    // Grab all events from entities
    const eventEntities: Event[] = [];
    for (const changeSet of args.uow.getChangeSets()) {
      if (changeSet.entity instanceof BaseEntity) {
        const entity = changeSet.entity;
        const events = entity.getAndClearEvents();

        for (const event of events) {
          eventEntities.push(new Event(event.name, event.payload));
        }
      }
    }

    // Store them
    if (eventEntities.length > 0) {
      args.em.persist(eventEntities);
    }
  }

  @Cron('*/5 * * * * *')
  async processEvents(): Promise<void> {
    const em = this.entityManager.fork();
    const unprocessedEvents = await em.find(Event, {
      processedAt: null,
    });

    unprocessedEvents.forEach((event) => {
      this.eventEmitter.emitAsync(event.name, event.payload);
      event.processedAt = new Date();
    });

    if (unprocessedEvents.length > 0) {
      console.log(`Processed ${unprocessedEvents.length} events`);
      await em.flush();
    }
  }
}
