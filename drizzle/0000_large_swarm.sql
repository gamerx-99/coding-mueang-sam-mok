CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer,
	"customerName" varchar(160) NOT NULL,
	"contact" varchar(320) NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"durationMinutes" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"action" varchar(80) NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contentSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentKey" varchar(120) NOT NULL,
	"language" text DEFAULT 'th' NOT NULL,
	"value" text NOT NULL,
	"updatedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"contact" varchar(320) NOT NULL,
	"businessType" varchar(100),
	"serviceType" varchar(100),
	"budget" varchar(100),
	"details" text,
	"status" text DEFAULT 'new' NOT NULL,
	"source" varchar(60) DEFAULT 'website' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mediaAssets" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot" varchar(120) NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"storageKey" varchar(500) NOT NULL,
	"url" varchar(700) NOT NULL,
	"mimeType" varchar(100) NOT NULL,
	"fileSize" integer NOT NULL,
	"altText" varchar(255),
	"uploadedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"clientName" varchar(180),
	"serviceType" varchar(100),
	"status" text DEFAULT 'idea' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"dueAt" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer,
	"serviceType" varchar(100) NOT NULL,
	"scope" text,
	"estimatedMin" integer NOT NULL,
	"estimatedMax" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
