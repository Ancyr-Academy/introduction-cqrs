import { Migration } from '@mikro-orm/migrations';

export class Migration20250129033102 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user_profile_view\` (\`id\` text not null, \`content\` json not null, primary key (\`id\`));`);
  }

}
