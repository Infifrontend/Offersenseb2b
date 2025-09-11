CREATE TABLE "non_air_markup_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_code" varchar(50) NOT NULL,
	"supplier_code" varchar(50),
	"product_code" varchar(50) NOT NULL,
	"pos" json NOT NULL,
	"agent_tier" json NOT NULL,
	"cohort_codes" json,
	"channel" varchar(20) NOT NULL,
	"adjustment_type" varchar(20) NOT NULL,
	"adjustment_value" numeric(10, 2) NOT NULL,
	"tiered_commission" json,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "non_air_markup_rules_rule_code_unique" UNIQUE("rule_code")
);
--> statement-breakpoint
CREATE TABLE "non_air_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_code" varchar(50) NOT NULL,
	"product_code" varchar(50) NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"net_rate" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"region" json NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"inventory" integer,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
