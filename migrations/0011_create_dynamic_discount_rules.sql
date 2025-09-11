
CREATE TABLE IF NOT EXISTS "dynamic_discount_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_code" varchar(50) NOT NULL,
	"fare_source" varchar(20) NOT NULL,
	"origin" varchar(3) NOT NULL,
	"destination" varchar(3) NOT NULL,
	"cabin_class" varchar(20) NOT NULL,
	"trip_type" varchar(20) NOT NULL,
	"pos" json NOT NULL,
	"market_region" varchar(50),
	"agent_tier" json NOT NULL,
	"cohort_codes" json,
	"channel" varchar(20) NOT NULL,
	"booking_window_min" integer,
	"booking_window_max" integer,
	"travel_window_min" integer,
	"travel_window_max" integer,
	"season_code" varchar(50),
	"adjustment_type" varchar(20) NOT NULL,
	"adjustment_value" numeric(10, 2) NOT NULL,
	"stackable" varchar(5) DEFAULT 'false',
	"priority" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dynamic_discount_rules_rule_code_unique" UNIQUE("rule_code")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_dynamic_discount_rules_status" ON "dynamic_discount_rules" ("status");
CREATE INDEX IF NOT EXISTS "idx_dynamic_discount_rules_origin_destination" ON "dynamic_discount_rules" ("origin", "destination");
CREATE INDEX IF NOT EXISTS "idx_dynamic_discount_rules_valid_dates" ON "dynamic_discount_rules" ("valid_from", "valid_to");
CREATE INDEX IF NOT EXISTS "idx_dynamic_discount_rules_priority" ON "dynamic_discount_rules" ("priority");
