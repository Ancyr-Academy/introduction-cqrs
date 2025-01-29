import { Migration } from '@mikro-orm/migrations';

export class Migration20250129015422 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` text not null, \`email_address\` text not null, \`first_name\` text not null, \`last_name\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`article\` (\`id\` text not null, \`user_id\` text not null, \`title\` text not null, \`content\` text not null, constraint \`article_user_id_foreign\` foreign key(\`user_id\`) references \`user\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`article_user_id_index\` on \`article\` (\`user_id\`);`);

    this.addSql(`create table \`clap\` (\`id\` text not null, \`article_id\` text not null, \`count\` integer not null, constraint \`clap_article_id_foreign\` foreign key(\`article_id\`) references \`article\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`clap_article_id_index\` on \`clap\` (\`article_id\`);`);
  }

}
