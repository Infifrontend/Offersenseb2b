
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user" varchar(100) NOT NULL,
	"module" varchar(50) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"action" varchar(20) NOT NULL,
	"before_data" json,
	"after_data" json,
	"diff" json,
	"justification" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(100),
	"created_at" timestamp DEFAULT now()
);
