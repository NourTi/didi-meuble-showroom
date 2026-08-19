CREATE TABLE `orderRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`customerName` varchar(120) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`wilaya` varchar(80) NOT NULL,
	`commune` varchar(100) NOT NULL,
	`address` text NOT NULL,
	`productLabel` varchar(220) NOT NULL,
	`quantity` int NOT NULL,
	`notes` text,
	`status` enum('new','contacted','confirmed','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `orderRequests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`category` enum('bedrooms','sofas','kids') NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameFr` varchar(180) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionFr` text NOT NULL,
	`priceDzd` int NOT NULL,
	`dimensions` varchar(120) NOT NULL,
	`imageUrl` text,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
