import { Migration } from '@mikro-orm/migrations';

export class Migration20250203050633 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`event\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`payload\` json not null, \`created_at\` datetime not null, \`processed_at\` datetime null);`);
  }

}
