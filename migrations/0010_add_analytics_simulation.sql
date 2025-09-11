
-- Analytics & Simulation Tables
CREATE TABLE IF NOT EXISTS "simulations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_name" varchar(200) NOT NULL,
	"scope" json NOT NULL,
	"change" json NOT NULL,
	"forecast" json NOT NULL,
	"actual_results" json,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "insight_queries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_text" text NOT NULL,
	"filters" json,
	"response" json,
	"execution_time_ms" integer,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_simulations_status" ON "simulations" ("status");
CREATE INDEX IF NOT EXISTS "idx_simulations_created_by" ON "simulations" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_insight_queries_created_by" ON "insight_queries" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_insight_queries_status" ON "insight_queries" ("status");
