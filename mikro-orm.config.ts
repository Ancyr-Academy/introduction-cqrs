import { defineConfig } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { allEntities } from './src/domain/all-entities';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  dbName: 'app.db',
  entities: allEntities,
  extensions: [Migrator, SeedManager],
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './migrations',
    pathTs: './migrations',
    glob: '*.{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    emit: 'ts',
  },
  seeder: {
    path: './seeders',
  },
  metadataProvider: TsMorphMetadataProvider,
});
