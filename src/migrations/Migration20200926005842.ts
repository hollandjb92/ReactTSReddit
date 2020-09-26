import { Migration } from '@mikro-orm/migrations';

export class Migration20200926005842 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop constraint if exists "user_created_at_check";');
  }

}
