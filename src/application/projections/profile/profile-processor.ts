import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ProfileProjector } from './profile-projector';
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

@Processor('profile-projection')
export class ProfileProcessor extends WorkerHost {
  constructor(private readonly projector: ProfileProjector) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'create-user': {
        const data = job.data as UserCreatedEvent;
        return this.projector.synchronize(data.userId);
      }
      case 'update-user': {
        const data = job.data as UserUpdatedEvent;
        return this.projector.onUserUpdated(data);
      }
      case 'create-article': {
        const data = job.data as ArticleCreatedEvent;
        return this.projector.onArticleCreated(data);
      }
      case 'update-article': {
        const data = job.data as ArticleUpdatedEvent;
        return this.projector.onArticleUpdated(data);
      }
      case 'delete-article': {
        const data = job.data as ArticleDeletedEvent;
        return this.projector.onArticleDeleted(data);
      }
      case 'create-clap': {
        const data = job.data as ClapCreatedEvent;
        return this.projector.onClapCreated(data);
      }
      case 'update-clap': {
        const data = job.data as ClapUpdatedEvent;
        return this.projector.onClapUpdated(data);
      }
      case 'delete-clap': {
        const data = job.data as ClapDeletedEvent;
        return this.projector.onClapDeleted(data);
      }
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
