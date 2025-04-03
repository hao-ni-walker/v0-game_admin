ALTER TABLE `users` ADD `username` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(255) DEFAULT '/avatars/default.jpg';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `last_login`;