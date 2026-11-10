import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const tickets = sqliteTable("tickets", {id:text("id").primaryKey(), data:text("data").notNull(), updated:text("updated").notNull()});
export const members=sqliteTable('members',{email:text('email').primaryKey(),name:text('name').notNull(),role:text('role').notNull(),active:text('active').notNull(),groups:text('groups').notNull()});
export const groups=sqliteTable('groups',{id:text('id').primaryKey(),name:text('name').notNull(),description:text('description').notNull()});
export const audit=sqliteTable('audit',{id:text('id').primaryKey(),date:text('date').notNull(),actor:text('actor').notNull(),action:text('action').notNull(),target:text('target').notNull(),details:text('details').notNull()});
