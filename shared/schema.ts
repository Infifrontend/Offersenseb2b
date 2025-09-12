import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, date, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const negotiatedFares = pgTable("negotiated_fares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airlineCode: varchar("airline_code", { length: 2 }).notNull(),
  fareCode: varchar("fare_code", { length: 50 }).notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  tripType: varchar("trip_type", { length: 20 }).notNull(), // ONE_WAY | ROUND_TRIP | MULTI_CITY
  cabinClass: varchar("cabin_class", { length: 20 }).notNull(), // ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
  baseNetFare: decimal("base_net_fare", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  bookingStartDate: date("booking_start_date").notNull(),
  bookingEndDate: date("booking_end_date").notNull(),
  travelStartDate: date("travel_start_date").notNull(),
  travelEndDate: date("travel_end_date").notNull(),
  pos: json("pos").notNull(), // array of ISO country codes
  seatAllotment: integer("seat_allotment"),
  minStay: integer("min_stay"),
  maxStay: integer("max_stay"),
  blackoutDates: json("blackout_dates"), // array of dates
  eligibleAgentTiers: json("eligible_agent_tiers").notNull(), // array: PLATINUM/GOLD/SILVER/BRONZE
  eligibleCohorts: json("eligible_cohorts"), // array of cohortCodes
  remarks: text("remarks"),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE | CONFLICTED
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNegotiatedFareSchema = createInsertSchema(negotiatedFares, {
  baseNetFare: z.string().transform((val) => parseFloat(val)),
  pos: z.array(z.string()),
  blackoutDates: z.array(z.string()).optional(),
  eligibleAgentTiers: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])),
  eligibleCohorts: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const dynamicDiscountRules = pgTable("dynamic_discount_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  fareSource: varchar("fare_source", { length: 20 }).notNull(), // API_GDS_NDC
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  cabinClass: varchar("cabin_class", { length: 20 }).notNull(),
  tripType: varchar("trip_type", { length: 20 }).notNull(),
  pos: json("pos").notNull(), // array of ISO country codes
  marketRegion: varchar("market_region", { length: 50 }),
  agentTier: json("agent_tier").notNull(), // array: PLATINUM/GOLD/SILVER/BRONZE
  cohortCodes: json("cohort_codes"), // array of cohort codes
  channel: varchar("channel", { length: 20 }).notNull(), // API | PORTAL | MOBILE
  bookingWindowMin: integer("booking_window_min"),
  bookingWindowMax: integer("booking_window_max"),
  travelWindowMin: integer("travel_window_min"),
  travelWindowMax: integer("travel_window_max"),
  seasonCode: varchar("season_code", { length: 50 }),
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // PERCENT | AMOUNT
  adjustmentValue: decimal("adjustment_value", { precision: 10, scale: 2 }).notNull(),
  stackable: varchar("stackable", { length: 5 }).default("false"), // true/false
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertDynamicDiscountRuleSchema = createInsertSchema(dynamicDiscountRules, {
  adjustmentValue: z.string().transform((val) => parseFloat(val)),
  pos: z.array(z.string()),
  agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])),
  cohortCodes: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const airAncillaryRules = pgTable("air_ancillary_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  ancillaryCode: varchar("ancillary_code", { length: 50 }).notNull(), // BAG20, SEAT_STD, MEAL_STD, WIFI_STD, LOUNGE_PASS
  airlineCode: varchar("airline_code", { length: 2 }), // Optional for carrier-specific
  origin: varchar("origin", { length: 3 }), // Optional
  destination: varchar("destination", { length: 3 }), // Optional
  pos: json("pos").notNull(), // array of ISO country codes
  channel: varchar("channel", { length: 20 }).notNull(), // API | PORTAL | MOBILE
  agentTier: json("agent_tier").notNull(), // array: PLATINUM/GOLD/SILVER/BRONZE
  cohortCodes: json("cohort_codes"), // array of cohort codes
  conditionBehavior: varchar("condition_behavior", { length: 30 }), // SKIPPED_ANCILLARY | POST_BOOKING
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // PERCENT | AMOUNT | FREE
  adjustmentValue: decimal("adjustment_value", { precision: 10, scale: 2 }), // ignored if FREE
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAirAncillaryRuleSchema = createInsertSchema(airAncillaryRules, {
  adjustmentValue: z.string().transform((val) => parseFloat(val)).optional(),
  pos: z.array(z.string()),
  agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])),
  cohortCodes: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NegotiatedFare = typeof negotiatedFares.$inferSelect;
export type InsertNegotiatedFare = z.infer<typeof insertNegotiatedFareSchema>;
export type DynamicDiscountRule = typeof dynamicDiscountRules.$inferSelect;
export type InsertDynamicDiscountRule = z.infer<typeof insertDynamicDiscountRuleSchema>;
export type AirAncillaryRule = typeof airAncillaryRules.$inferSelect;
export type InsertAirAncillaryRule = z.infer<typeof insertAirAncillaryRuleSchema>;

export const nonAirRates = pgTable("non_air_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierCode: varchar("supplier_code", { length: 50 }).notNull(),
  productCode: varchar("product_code", { length: 50 }).notNull(), // INS_STD, HOTEL_STD, TRANSFER_STD, VISA_STD, FOREX_STD
  productName: varchar("product_name", { length: 200 }).notNull(),
  netRate: decimal("net_rate", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  region: json("region").notNull(), // array of ISO country codes
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  inventory: integer("inventory"), // optional stock
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const nonAirMarkupRules = pgTable("non_air_markup_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  supplierCode: varchar("supplier_code", { length: 50 }), // optional, wildcards allowed
  productCode: varchar("product_code", { length: 50 }).notNull(), // wildcards allowed
  pos: json("pos").notNull(), // array of ISO country codes
  agentTier: json("agent_tier").notNull(), // array: PLATINUM/GOLD/SILVER/BRONZE
  cohortCodes: json("cohort_codes"), // array of cohort codes
  channel: varchar("channel", { length: 20 }).notNull(), // API | PORTAL | MOBILE
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // PERCENT | AMOUNT
  adjustmentValue: decimal("adjustment_value", { precision: 10, scale: 2 }).notNull(),
  tieredCommission: json("tiered_commission"), // optional table structure
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertNonAirRateSchema = createInsertSchema(nonAirRates, {
  netRate: z.string().transform((val) => parseFloat(val)),
  region: z.array(z.string()),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNonAirMarkupRuleSchema = createInsertSchema(nonAirMarkupRules, {
  adjustmentValue: z.string().transform((val) => parseFloat(val)),
  pos: z.array(z.string()),
  agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])),
  cohortCodes: z.array(z.string()).optional(),
  tieredCommission: z.array(z.object({
    tier: z.string(),
    commission: z.number(),
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NonAirRate = typeof nonAirRates.$inferSelect;
export type InsertNonAirRate = z.infer<typeof insertNonAirRateSchema>;
export type NonAirMarkupRule = typeof nonAirMarkupRules.$inferSelect;
export type InsertNonAirMarkupRule = z.infer<typeof insertNonAirMarkupRuleSchema>;

export const bundles = pgTable("bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bundleCode: varchar("bundle_code", { length: 50 }).notNull().unique(),
  bundleName: varchar("bundle_name", { length: 200 }).notNull(),
  components: json("components").notNull(), // array of SKUs: air/non-air product codes
  bundleType: varchar("bundle_type", { length: 20 }).notNull(), // AIR_AIR | AIR_NONAIR | NONAIR_NONAIR
  pos: json("pos").notNull(), // array of ISO country codes
  agentTier: json("agent_tier").notNull(), // array: PLATINUM/GOLD/SILVER/BRONZE
  cohortCodes: json("cohort_codes"), // array of cohort codes
  channel: varchar("channel", { length: 20 }).notNull(), // API | PORTAL | MOBILE
  seasonCode: varchar("season_code", { length: 50 }),
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  inventoryCap: integer("inventory_cap"), // optional inventory limits
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const bundlePricingRules = pgTable("bundle_pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  bundleCode: varchar("bundle_code", { length: 50 }).notNull(),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // PERCENT | AMOUNT
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  tieredPromo: json("tiered_promo"), // optional table: [{qty: number, discount: number}]
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBundleSchema = createInsertSchema(bundles, {
  components: z.array(z.string()),
  pos: z.array(z.string()),
  agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])),
  cohortCodes: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBundlePricingRuleSchema = createInsertSchema(bundlePricingRules, {
  discountValue: z.string().transform((val) => parseFloat(val)),
  tieredPromo: z.array(z.object({
    qty: z.number(),
    discount: z.number(),
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Bundle = typeof bundles.$inferSelect;
export type InsertBundle = z.infer<typeof insertBundleSchema>;
export type BundlePricingRule = typeof bundlePricingRules.$inferSelect;
export type InsertBundlePricingRule = z.infer<typeof insertBundlePricingRuleSchema>;

export const offerRules = pgTable("offer_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  ruleName: varchar("rule_name", { length: 200 }).notNull(),
  ruleType: varchar("rule_type", { length: 30 }).notNull(), // FARE_DISCOUNT | ANCILLARY_DISCOUNT | BUNDLE_OFFER | MARKUP
  conditions: json("conditions").notNull(), // complex conditions object
  actions: json("actions").notNull(), // array of actions to execute
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("DRAFT"), // DRAFT | ACTIVE | INACTIVE | PENDING_APPROVAL
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  justification: text("justification"), // required for overrides
  approvedBy: varchar("approved_by", { length: 50 }),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertOfferRuleSchema = createInsertSchema(offerRules, {
  conditions: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    pos: z.array(z.string()).optional(),
    agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])).optional(),
    cohortCodes: z.array(z.string()).optional(),
    channel: z.array(z.enum(["API", "PORTAL", "MOBILE"])).optional(),
    seasonCode: z.string().optional(),
    bookingWindow: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    travelWindow: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    cabinClass: z.array(z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])).optional(),
    tripType: z.array(z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"])).optional(),
  }),
  actions: z.array(z.object({
    type: z.enum(["DISCOUNT", "MARKUP", "ADD_ANCILLARY", "ACTIVATE_BUNDLE", "SUPPRESS_PRODUCT", "ADD_BANNER"]),
    scope: z.enum(["NEGOTIATED", "API", "ANCILLARY", "BUNDLE"]).optional(),
    valueType: z.enum(["PERCENT", "AMOUNT", "FREE"]).optional(),
    value: z.number().optional(),
    ancillaryCode: z.string().optional(),
    bundleCode: z.string().optional(),
    productCode: z.string().optional(),
    bannerText: z.string().optional(),
    pricing: z.object({
      type: z.enum(["PERCENT", "AMOUNT", "FREE"]),
      value: z.number().optional()
    }).optional(),
  })),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export type OfferRule = typeof offerRules.$inferSelect;
export type InsertOfferRule = z.infer<typeof insertOfferRuleSchema>;

export const offerTraces = pgTable("offer_traces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  traceId: varchar("trace_id", { length: 50 }).notNull().unique(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  searchParams: json("search_params").notNull(), // origin, destination, dates, pax, etc.
  agentTier: varchar("agent_tier", { length: 20 }).notNull(),
  cohorts: json("cohorts"), // array of cohort codes
  fareSource: varchar("fare_source", { length: 20 }).notNull(), // NEGOTIATED | API
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  adjustments: json("adjustments"), // array of rule adjustments applied
  ancillaries: json("ancillaries"), // array of ancillary offers
  bundles: json("bundles"), // array of bundle offers
  finalOfferPrice: decimal("final_offer_price", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  auditTraceId: varchar("audit_trace_id", { length: 50 }),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | EXPIRED
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertOfferTraceSchema = createInsertSchema(offerTraces, {
  basePrice: z.string().transform((val) => parseFloat(val)),
  finalOfferPrice: z.string().transform((val) => parseFloat(val)),
  commission: z.string().transform((val) => parseFloat(val)),
  searchParams: z.object({
    origin: z.string(),
    destination: z.string(),
    tripType: z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]),
    pax: z.array(z.object({
      type: z.string(),
      count: z.number()
    })),
    cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
    dates: z.object({
      depart: z.string(),
      return: z.string().optional()
    }),
    channel: z.enum(["API", "PORTAL", "MOBILE"]),
  }),
  cohorts: z.array(z.string()).optional(),
  adjustments: z.array(z.object({
    rule: z.string(),
    type: z.string(),
    value: z.number()
  })).optional(),
  ancillaries: z.array(z.object({
    code: z.string(),
    base: z.number(),
    discount: z.number().optional(),
    sell: z.number()
  })).optional(),
  bundles: z.array(z.object({
    code: z.string(),
    sell: z.number(),
    saveVsIndiv: z.number().optional()
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OfferTrace = typeof offerTraces.$inferSelect;
export type InsertOfferTrace = z.infer<typeof insertOfferTraceSchema>;

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 50 }).notNull().unique(),
  agencyName: varchar("agency_name", { length: 200 }).notNull(),
  iataCode: varchar("iata_code", { length: 10 }),
  tier: varchar("tier", { length: 20 }).notNull(), // PLATINUM | GOLD | SILVER | BRONZE
  allowedChannels: json("allowed_channels").notNull(), // array of API/PORTAL/MOBILE
  commissionProfileId: varchar("commission_profile_id", { length: 50 }),
  pos: json("pos").notNull(), // array of ISO country codes
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const channelPricingOverrides = pgTable("channel_pricing_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  overrideCode: varchar("override_code", { length: 50 }).notNull().unique(),
  channel: varchar("channel", { length: 20 }).notNull(), // API | PORTAL | MOBILE
  pos: json("pos").notNull(), // array of ISO country codes
  productScope: varchar("product_scope", { length: 20 }).notNull(), // FARE | ANCILLARY | BUNDLE
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // PERCENT | AMOUNT
  adjustmentValue: decimal("adjustment_value", { precision: 10, scale: 2 }).notNull(),
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAgentSchema = createInsertSchema(agents, {
  allowedChannels: z.array(z.enum(["API", "PORTAL", "MOBILE"])),
  pos: z.array(z.string()),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelPricingOverrideSchema = createInsertSchema(channelPricingOverrides, {
  adjustmentValue: z.string().transform((val) => parseFloat(val)),
  pos: z.array(z.string()),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChannelPricingOverride = z.infer<typeof insertChannelPricingOverrideSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type ChannelPricingOverride = typeof channelPricingOverrides.$inferSelect;
export type InsertChannelPricingOverride = z.infer<typeof insertChannelPricingOverrideSchema>;

export const cohorts = pgTable("cohorts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cohortCode: varchar("cohort_code", { length: 50 }).notNull().unique(),
  cohortName: varchar("cohort_name", { length: 200 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // MARKET | CHANNEL | SEASON | BEHAVIOR
  criteria: json("criteria").notNull(), // JSON rules object
  description: text("description"),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCohortSchema = createInsertSchema(cohorts, {
  criteria: z.object({
    pos: z.array(z.string()).optional(),
    channel: z.enum(["API", "PORTAL", "MOBILE"]).optional(),
    device: z.enum(["DESKTOP", "MOBILE", "TABLET"]).optional(),
    bookingWindow: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    season: z.string().optional(),
    behavior: z.object({
      bookingFrequency: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
      averageBookingValue: z.object({
        min: z.number(),
        max: z.number()
      }).optional(),
      preferredCabinClass: z.array(z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])).optional(),
    }).optional(),
  }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = z.infer<typeof insertCohortSchema>;

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
  user: varchar("user", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // NegotiatedFare, DynamicDiscountRule, etc.
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 20 }).notNull(), // CREATED, UPDATED, DELETED, STATUS_CHANGED
  beforeData: json("before_data"), // snapshot before change
  afterData: json("after_data"), // snapshot after change
  diff: json("diff"), // specific field changes
  justification: text("justification"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 100 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs, {
  beforeData: z.any().optional(),
  afterData: z.any().optional(),
  diff: z.record(z.object({
    from: z.any(),
    to: z.any()
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Agent Tier Management Tables
export const agentTiers = pgTable("agent_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tierCode: varchar("tier_code", { length: 20 }).notNull().unique(), // PLATINUM | GOLD | SILVER | BRONZE
  displayName: varchar("display_name", { length: 100 }).notNull(),
  kpiWindow: varchar("kpi_window", { length: 20 }).notNull(), // MONTHLY | QUARTERLY
  kpiThresholds: json("kpi_thresholds").notNull(), // KPI criteria object
  defaultPricingPolicy: json("default_pricing_policy"), // default pricing rules
  description: text("description"),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const agentTierAssignments = pgTable("agent_tier_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  tierCode: varchar("tier_code", { length: 20 }).notNull(),
  assignmentType: varchar("assignment_type", { length: 20 }).notNull(), // AUTO | MANUAL_OVERRIDE
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  kpiData: json("kpi_data"), // snapshot of KPI values at assignment
  assignedBy: varchar("assigned_by", { length: 50 }).notNull(),
  justification: text("justification"),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | SUPERSEDED
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const tierAssignmentEngine = pgTable("tier_assignment_engine", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engineCode: varchar("engine_code", { length: 50 }).notNull().unique(),
  schedule: varchar("schedule", { length: 100 }).notNull(), // cron expression
  reassignmentMode: varchar("reassignment_mode", { length: 20 }).notNull(), // AUTO | REVIEW
  overrideAllowed: varchar("override_allowed", { length: 5 }).default("true"), // true/false
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE | INACTIVE
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAgentTierSchema = createInsertSchema(agentTiers, {
  kpiThresholds: z.object({
    totalBookingValueMin: z.number().min(0),
    totalBookingsMin: z.number().min(0),
    avgBookingsPerMonthMin: z.number().min(0),
    avgSearchesPerMonthMin: z.number().min(0),
    conversionPctMin: z.number().min(0).max(100),
  }),
  defaultPricingPolicy: z.object({
    type: z.enum(["PERCENT", "AMOUNT"]),
    value: z.number(),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentTierAssignmentSchema = createInsertSchema(agentTierAssignments, {
  kpiData: z.object({
    totalBookingValue: z.number().optional(),
    totalBookings: z.number().optional(),
    avgBookingsPerMonth: z.number().optional(),
    avgSearchesPerMonth: z.number().optional(),
    conversionPct: z.number().optional(),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTierAssignmentEngineSchema = createInsertSchema(tierAssignmentEngine).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
  nextRunAt: true,
});

export type AgentTier = typeof agentTiers.$inferSelect;
export type InsertAgentTier = z.infer<typeof insertAgentTierSchema>;
export type AgentTierAssignment = typeof agentTierAssignments.$inferSelect;
export type InsertAgentTierAssignment = z.infer<typeof insertAgentTierAssignmentSchema>;
export type TierAssignmentEngine = typeof tierAssignmentEngine.$inferSelect;
export type InsertTierAssignmentEngine = z.infer<typeof insertTierAssignmentEngineSchema>;

// Campaign Management Tables
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignCode: varchar("campaign_code", { length: 50 }).notNull().unique(),
  campaignName: varchar("campaign_name", { length: 200 }).notNull(),
  target: json("target").notNull(), // cohorts, agentTiers, pos, channel
  products: json("products").notNull(), // ancillaries, bundles
  offer: json("offer").notNull(), // discount type and value or special pricing
  lifecycle: json("lifecycle").notNull(), // startDate, endDate, frequency, maxSends, capPerPNR
  comms: json("comms").notNull(), // portalBanner, emailTemplateId, whatsappTemplateId, apiPush
  status: varchar("status", { length: 20 }).default("DRAFT"), // DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const campaignMetrics = pgTable("campaign_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignCode: varchar("campaign_code", { length: 50 }).notNull(),
  date: date("date").notNull(),
  sent: integer("sent").default(0),
  delivered: integer("delivered").default(0),
  opened: integer("opened").default(0),
  clicked: integer("clicked").default(0),
  purchased: integer("purchased").default(0),
  revenueUplift: decimal("revenue_uplift", { precision: 10, scale: 2 }).default("0"),
  attachRate: decimal("attach_rate", { precision: 5, scale: 2 }).default("0"),
  roi: decimal("roi", { precision: 5, scale: 2 }).default("0"),
  breakdown: json("breakdown"), // breakdown by cohort/tier/agent/pos/channel
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const campaignDeliveries = pgTable("campaign_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignCode: varchar("campaign_code", { length: 50 }).notNull(),
  bookingReference: varchar("booking_reference", { length: 50 }).notNull(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  deliveryChannel: varchar("delivery_channel", { length: 20 }).notNull(), // PORTAL | EMAIL | WHATSAPP | API
  deliveryStatus: varchar("delivery_status", { length: 20 }).default("PENDING"), // PENDING | SENT | DELIVERED | FAILED
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  purchasedAt: timestamp("purchased_at"),
  purchaseAmount: decimal("purchase_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCampaignSchema = createInsertSchema(campaigns, {
  target: z.object({
    cohorts: z.array(z.string()).optional(),
    agentTiers: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])).optional(),
    pos: z.array(z.string()).optional(),
    channel: z.array(z.enum(["PORTAL", "API", "MOBILE"])).optional(),
  }),
  products: z.object({
    ancillaries: z.array(z.string()).optional(),
    bundles: z.array(z.string()).optional(),
  }),
  offer: z.object({
    type: z.enum(["PERCENT", "AMOUNT", "SPECIAL_PRICE"]),
    value: z.number().optional(),
    specialPrice: z.number().optional(),
  }),
  lifecycle: z.object({
    startDate: z.string(),
    endDate: z.string(),
    frequency: z.string().optional(), // cron expression
    maxSends: z.number().optional(),
    capPerPNR: z.number().optional(),
  }),
  comms: z.object({
    portalBanner: z.boolean().optional(),
    emailTemplateId: z.string().optional(),
    whatsappTemplateId: z.string().optional(),
    apiPush: z.boolean().optional(),
  }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics, {
  revenueUplift: z.string().transform((val) => parseFloat(val)),
  attachRate: z.string().transform((val) => parseFloat(val)),
  roi: z.string().transform((val) => parseFloat(val)),
  breakdown: z.record(z.any()).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignDeliverySchema = createInsertSchema(campaignDeliveries, {
  purchaseAmount: z.string().transform((val) => parseFloat(val)).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetrics = z.infer<typeof insertCampaignMetricsSchema>;
export type CampaignDelivery = typeof campaignDeliveries.$inferSelect;
export type InsertCampaignDelivery = z.infer<typeof insertCampaignDeliverySchema>;

// Analytics & Simulation Tables
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioName: varchar("scenario_name", { length: 200 }).notNull(),
  scope: json("scope").notNull(), // target scope: OD, pos, tiers, cohorts, channel
  change: json("change").notNull(), // proposed rule changes
  forecast: json("forecast").notNull(), // forecast metrics
  actualResults: json("actual_results"), // actual performance data
  status: varchar("status", { length: 20 }).default("DRAFT"), // DRAFT | RUNNING | COMPLETED | CANCELLED
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insightQueries = pgTable("insight_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryText: text("query_text").notNull(),
  filters: json("filters"), // time range, pos, tiers/cohorts filters
  response: json("response"), // NLP processing result and answer
  executionTimeMs: integer("execution_time_ms"),
  status: varchar("status", { length: 20 }).default("PENDING"), // PENDING | PROCESSING | COMPLETED | ERROR
  createdBy: varchar("created_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSimulationSchema = createInsertSchema(simulations, {
  scope: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    pos: z.array(z.string()).optional(),
    agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])).optional(),
    cohorts: z.array(z.string()).optional(),
    channel: z.array(z.enum(["API", "PORTAL", "MOBILE"])).optional(),
  }),
  change: z.object({
    ruleCode: z.string().optional(),
    ruleType: z.enum(["DISCOUNT", "MARKUP", "ANCILLARY", "BUNDLE"]),
    adjustment: z.object({
      type: z.enum(["PERCENT", "AMOUNT"]),
      value: z.number(),
    }),
    description: z.string().optional(),
  }),
  forecast: z.object({
    revenueChangePct: z.string(),
    conversionChangePct: z.string(),
    marginImpactPct: z.string(),
    attachRateChangePct: z.string().optional(),
    customerSatisfactionImpact: z.string().optional(),
  }),
  actualResults: z.object({
    revenueChangePct: z.string(),
    conversionChangePct: z.string(),
    marginImpactPct: z.string(),
    attachRateChangePct: z.string().optional(),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsightQuerySchema = createInsertSchema(insightQueries, {
  filters: z.object({
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
    pos: z.array(z.string()).optional(),
    agentTier: z.array(z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"])).optional(),
    cohorts: z.array(z.string()).optional(),
    channel: z.array(z.enum(["API", "PORTAL", "MOBILE"])).optional(),
  }).optional(),
  response: z.object({
    answer: z.string(),
    data: z.any().optional(),
    confidence: z.number().optional(),
    sources: z.array(z.string()).optional(),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type InsightQuery = typeof insightQueries.$inferSelect;
export type InsertInsightQuery = z.infer<typeof insertInsightQuerySchema>;