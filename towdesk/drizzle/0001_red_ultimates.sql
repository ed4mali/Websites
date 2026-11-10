CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`record_id` text NOT NULL,
	`summary` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_owner_record` ON `events` (`owner`,`record_id`);--> statement-breakpoint
CREATE INDEX `records_owner_kind` ON `records` (`owner`,`kind`);