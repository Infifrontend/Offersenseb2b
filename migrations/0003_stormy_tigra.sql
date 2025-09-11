CREATE TABLE "offer_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_code" varchar(50) NOT NULL,
	"rule_name" varchar(200) NOT NULL,
	"rule_type" varchar(30) NOT NULL,
	"conditions" json NOT NULL,
	"actions" json NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT',
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"justification" text,
	"approved_by" varchar(50),
	"approved_at" timestamp,
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "offer_rules_rule_code_unique" UNIQUE("rule_code")
);
