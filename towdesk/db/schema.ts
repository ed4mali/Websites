import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),owner:text('owner').notNull(),kind:text('kind').notNull(),payload:text('payload').notNull(),revision:text('revision').notNull()},t=>[index('records_owner_kind').on(t.owner,t.kind)]);
export const events=sqliteTable('events',{id:text('id').primaryKey(),owner:text('owner').notNull(),recordId:text('record_id').notNull(),summary:text('summary').notNull(),created:text('created').notNull()},t=>[index('events_owner_record').on(t.owner,t.recordId)]);
