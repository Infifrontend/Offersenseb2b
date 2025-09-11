
CREATE TABLE "agent_tiers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier_code" varchar(20) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"kpi_window" varchar(20) NOT NULL,
	"kpi_thresholds" json NOT NULL,
	"default_pricing_policy" json,
	"description" text,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agent_tiers_tier_code_unique" UNIQUE("tier_code")
);
--> statement-breakpoint
CREATE TABLE "agent_tier_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar(50) NOT NULL,
	"tier_code" varchar(20) NOT NULL,
	"assignment_type" varchar(20) NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"kpi_data" json,
	"assigned_by" varchar(50) NOT NULL,
	"justification" text,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tier_assignment_engine" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engine_code" varchar(50) NOT NULL,
	"schedule" varchar(100) NOT NULL,
	"reassignment_mode" varchar(20) NOT NULL,
	"override_allowed" varchar(5) DEFAULT 'true',
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tier_assignment_engine_engine_code_unique" UNIQUE("engine_code")
);

-- Insert default tiers
INSERT INTO agent_tiers (tier_code, display_name, kpi_window, kpi_thresholds, default_pricing_policy, description, created_by) VALUES 
('PLATINUM', 'Platinum', 'QUARTERLY', '{"totalBookingValueMin": 50000000, "totalBookingsMin": 1500, "avgBookingsPerMonthMin": 400, "avgSearchesPerMonthMin": 5000, "conversionPctMin": 8.0}', '{"type": "PERCENT", "value": -2}', 'Highest tier for premium agents', 'system'),
('GOLD', 'Gold', 'QUARTERLY', '{"totalBookingValueMin": 25000000, "totalBookingsMin": 800, "avgBookingsPerMonthMin": 200, "avgSearchesPerMonthMin": 3000, "conversionPctMin": 6.0}', '{"type": "PERCENT", "value": -1}', 'Gold tier for high-performing agents', 'system'),
('SILVER', 'Silver', 'QUARTERLY', '{"totalBookingValueMin": 10000000, "totalBookingsMin": 400, "avgBookingsPerMonthMin": 100, "avgSearchesPerMonthMin": 1500, "conversionPctMin": 4.0}', '{"type": "PERCENT", "value": 0}', 'Silver tier for standard agents', 'system'),
('BRONZE', 'Bronze', 'QUARTERLY', '{"totalBookingValueMin": 0, "totalBookingsMin": 0, "avgBookingsPerMonthMin": 0, "avgSearchesPerMonthMin": 0, "conversionPctMin": 0}', '{"type": "PERCENT", "value": 1}', 'Entry-level tier for new agents', 'system');

-- Create indexes
CREATE INDEX idx_agent_tier_assignments_agent_id ON agent_tier_assignments(agent_id);
CREATE INDEX idx_agent_tier_assignments_tier_code ON agent_tier_assignments(tier_code);
CREATE INDEX idx_agent_tier_assignments_status ON agent_tier_assignments(status);
CREATE INDEX idx_agent_tier_assignments_effective ON agent_tier_assignments(effective_from, effective_to);
