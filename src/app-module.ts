import { AppController } from './application/controllers/app-controller';
import { UserService } from './application/services/user-service';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { allEntities } from './domain/all-entities';
import { UserController } from './application/controllers/user-controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ArticleController } from './application/controllers/article-controller';
import { ClapsController } from './application/controllers/claps-controller';
import { ClapsService } from './application/services/claps-service';
import { ArticleService } from './application/services/article-service';
import { UserProfileProjector } from './application/services/user-profile-projector';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
  ],
  controllers: [
    AppController,
    UserController,
    ArticleController,
    ClapsController,
  ],
  providers: [
    UserProfileProjector,
    UserService,
    ArticleService,
    ClapsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
