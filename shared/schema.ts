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
