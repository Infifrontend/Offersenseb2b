CREATE TABLE "agents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"agency_name" varchar(200) NOT NULL,
	"iata_code" varchar(10),
	"tier" varchar(20) NOT NULL,
	"allowed_channels" json NOT NULL,
	"commission_profile_id" varchar(50),
	"pos" json NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agents_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "channel_pricing_overrides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"override_code" varchar(50) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"pos" json NOT NULL,
	"product_scope" varchar(20) NOT NULL,
	"adjustment_type" varchar(20) NOT NULL,
	"adjustment_value" numeric(10, 2) NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "channel_pricing_overrides_override_code_unique" UNIQUE("override_code")
);
