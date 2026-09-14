CREATE TABLE `analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`file_name` text NOT NULL,
	`job_title` text NOT NULL,
	`overall_score` integer NOT NULL,
	`matched_skills` text NOT NULL,
	`missing_skills` text NOT NULL,
	`created_at` text NOT NULL
);
