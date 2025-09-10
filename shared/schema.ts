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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NegotiatedFare = typeof negotiatedFares.$inferSelect;
export type InsertNegotiatedFare = z.infer<typeof insertNegotiatedFareSchema>;
