import { Migration } from '@mikro-orm/migrations';

export class Migration20240304201748 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" date not null, "updated_at" date not null, "title" text not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
