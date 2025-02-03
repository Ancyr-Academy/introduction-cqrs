import { AppController } from './application/controllers/app-controller';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { allEntities } from './domain/all-entities';
import { UserController } from './application/controllers/user-controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ArticleController } from './application/controllers/article-controller';
import { ClapsController } from './application/controllers/claps-controller';
import { UserProfileProjector } from './application/services/user-profile-projector';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisService } from './infrastructure/redis-service';
import { CqrsModule } from '@nestjs/cqrs';
import { AppCommandBus } from './infrastructure/app-command-bus';
import { CreateArticleHandler } from './application/commands/create-article';
import { CreateClapHandler } from './application/commands/create-clap';
import { CreateUserHandler } from './application/commands/create-user';
import { DeleteArticleHandler } from './application/commands/delete-article';
import { DeleteClapHandler } from './application/commands/delete-clap';
import { UpdateArticleHandler } from './application/commands/update-article';
import { UpdateClapHandler } from './application/commands/update-clap';
import { UpdateUserHandler } from './application/commands/update-user';
import { GetUserHandler } from './application/queries/get-user';
import { TransactionalEventSubscriber } from './infrastructure/transactional-event-subscriber';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: () => {
        return {
          driver: SqliteDriver,
          entities: allEntities,
          metadataProvider: TsMorphMetadataProvider,
          dynamicImportProvider: (id) => import(id),
          dbName: 'app.db',
          ensureDatabase: true,
          migrations: {},
        };
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    UserController,
    ArticleController,
    ClapsController,
  ],
  providers: [
    UserProfileProjector,
    AppCommandBus,
    TransactionalEventSubscriber,
    RedisService,
    CreateArticleHandler,
    CreateClapHandler,
    CreateUserHandler,
    DeleteArticleHandler,
    DeleteClapHandler,
    UpdateArticleHandler,
    UpdateClapHandler,
    UpdateUserHandler,
    GetUserHandler,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
