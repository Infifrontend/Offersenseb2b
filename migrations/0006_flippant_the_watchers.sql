CREATE TABLE "cohorts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cohort_code" varchar(50) NOT NULL,
	"cohort_name" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"criteria" json NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cohorts_cohort_code_unique" UNIQUE("cohort_code")
);
