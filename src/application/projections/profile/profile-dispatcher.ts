import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
} from '../../../domain/events/user-events';
import {
  ArticleCreatedEvent,
  ArticleDeletedEvent,
  ArticleUpdatedEvent,
} from '../../../domain/events/article-events';
import {
  ClapCreatedEvent,
  ClapDeletedEvent,
  ClapUpdatedEvent,
} from '../../../domain/events/clap-events';

@Injectable()
export class ProfileDispatcher {
  constructor(
    @InjectQueue('profile-projection') private readonly queue: Queue,
  ) {}

  @OnEvent('user.created', { async: true })
  async onUserCreated(event: UserCreatedEvent) {
    return this.queue.add('create-user', event);
  }

  @OnEvent('user.updated', { async: true })
  async onUserUpdated(event: UserUpdatedEvent) {
    return this.queue.add('update-user', event);
  }

  @OnEvent('article.created', { async: true })
  async onArticleCreated(event: ArticleCreatedEvent) {
    return this.queue.add('create-article', event);
  }

  @OnEvent('article.updated', { async: true })
  async onArticleUpdated(event: ArticleUpdatedEvent) {
    return this.queue.add('update-article', event);
  }

  @OnEvent('article.deleted', { async: true })
  async onArticleDeleted(event: ArticleDeletedEvent) {
    return this.queue.add('delete-article', event);
  }

  @OnEvent('clap.created', { async: true })
  async onClapCreated(event: ClapCreatedEvent) {
    return this.queue.add('create-clap', event);
  }

  @OnEvent('clap.updated', { async: true })
  async onClapUpdated(event: ClapUpdatedEvent) {
    return this.queue.add('update-clap', event);
  }

  @OnEvent('clap.deleted', { async: true })
  async onClapDeleted(event: ClapDeletedEvent) {
    return this.queue.add('delete-clap', event);
  }
}
