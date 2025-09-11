CREATE TABLE "bundle_pricing_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_code" varchar(50) NOT NULL,
	"bundle_code" varchar(50) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"tiered_promo" json,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bundle_pricing_rules_rule_code_unique" UNIQUE("rule_code")
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_code" varchar(50) NOT NULL,
	"bundle_name" varchar(200) NOT NULL,
	"components" json NOT NULL,
	"bundle_type" varchar(20) NOT NULL,
	"pos" json NOT NULL,
	"agent_tier" json NOT NULL,
	"cohort_codes" json,
	"channel" varchar(20) NOT NULL,
	"season_code" varchar(50),
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"inventory_cap" integer,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bundles_bundle_code_unique" UNIQUE("bundle_code")
);
