import { users, negotiatedFares, dynamicDiscountRules, airAncillaryRules, nonAirRates, nonAirMarkupRules, type User, type NegotiatedFare, type InsertUser, type InsertNegotiatedFare, type InsertDynamicDiscountRule, type InsertAirAncillaryRule, type InsertNonAirRate, type InsertNonAirMarkupRule } from "../shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, ilike, inArray, sql } from "drizzle-orm";


export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  insertNegotiatedFare(fare: InsertNegotiatedFare): Promise<NegotiatedFare>;
  getNegotiatedFares(filters?: any): Promise<NegotiatedFare[]>;
  getNegotiatedFareById(id: string): Promise<NegotiatedFare | undefined>;
  updateNegotiatedFare(id: string, updates: Partial<InsertNegotiatedFare>): Promise<NegotiatedFare>;
  deleteNegotiatedFare(id: string): Promise<void>;
  checkFareConflicts(fare: InsertNegotiatedFare): Promise<NegotiatedFare[]>;

  // Dynamic Discount Rules
  getDynamicDiscountRules(filters?: any): Promise<InsertDynamicDiscountRule[]>;
  getDynamicDiscountRuleById(id: string): Promise<InsertDynamicDiscountRule | undefined>;
  insertDynamicDiscountRule(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule>;
  updateDynamicDiscountRule(id: string, rule: Partial<InsertDynamicDiscountRule>): Promise<InsertDynamicDiscountRule>;
  updateDynamicDiscountRuleStatus(id: string, status: string): Promise<InsertDynamicDiscountRule>;
  deleteDynamicDiscountRule(id: string): Promise<void>;
  checkDiscountRuleConflicts(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule[]>;

  // Air Ancillary Rules
  getAirAncillaryRules(filters?: any): Promise<InsertAirAncillaryRule[]>;
  getAirAncillaryRuleById(id: string): Promise<InsertAirAncillaryRule | undefined>;
  insertAirAncillaryRule(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule>;
  updateAirAncillaryRule(id: string, rule: Partial<InsertAirAncillaryRule>): Promise<InsertAirAncillaryRule>;
  updateAirAncillaryRuleStatus(id: string, status: string): Promise<InsertAirAncillaryRule>;
  deleteAirAncillaryRule(id: string): Promise<void>;
  checkAirAncillaryRuleConflicts(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule[]>;

  // Non-Air Ancillary Rates
  insertNonAirRate(rate: InsertNonAirRate): Promise<InsertNonAirRate>;
  getNonAirRates(filters?: any): Promise<InsertNonAirRate[]>;
  getNonAirRateById(id: string): Promise<InsertNonAirRate | undefined>;
  updateNonAirRate(id: string, rate: Partial<InsertNonAirRate>): Promise<InsertNonAirRate>;
  deleteNonAirRate(id: string): Promise<void>;

  // Non-Air Markup Rules
  insertNonAirMarkupRule(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule>;
  getNonAirMarkupRules(filters?: any): Promise<InsertNonAirMarkupRule[]>;
  getNonAirMarkupRuleById(id: string): Promise<InsertNonAirMarkupRule | undefined>;
  updateNonAirMarkupRule(id: string, rule: Partial<InsertNonAirMarkupRule>): Promise<InsertNonAirMarkupRule>;
  updateNonAirMarkupRuleStatus(id: string, status: string): Promise<InsertNonAirMarkupRule>;
  deleteNonAirMarkupRule(id: string): Promise<void>;
  checkNonAirMarkupRuleConflicts(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async insertNegotiatedFare(fare: InsertNegotiatedFare): Promise<NegotiatedFare> {
    // Convert number baseNetFare to string for PostgreSQL decimal type
    const processedFare = { ...fare };
    if (typeof processedFare.baseNetFare === 'number') {
      processedFare.baseNetFare = processedFare.baseNetFare.toString() as any;
    }

    const [newFare] = await db.insert(negotiatedFares).values(processedFare).returning();
    return newFare;
  }

  async getNegotiatedFares(filters: any = {}): Promise<NegotiatedFare[]> {
    let query = db.select().from(negotiatedFares);

    const conditions = [];

    if (filters.airlineCode) {
      conditions.push(eq(negotiatedFares.airlineCode, filters.airlineCode));
    }

    if (filters.origin) {
      conditions.push(eq(negotiatedFares.origin, filters.origin));
    }

    if (filters.destination) {
      conditions.push(eq(negotiatedFares.destination, filters.destination));
    }

    if (filters.cabinClass) {
      conditions.push(eq(negotiatedFares.cabinClass, filters.cabinClass));
    }

    if (filters.status) {
      conditions.push(eq(negotiatedFares.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getNegotiatedFareById(id: string): Promise<NegotiatedFare | undefined> {
    const [fare] = await db.select().from(negotiatedFares).where(eq(negotiatedFares.id, id));
    return fare || undefined;
  }

  async updateNegotiatedFare(id: string, updates: Partial<InsertNegotiatedFare>): Promise<NegotiatedFare> {
    // Convert number baseNetFare to string for PostgreSQL decimal type
    const processedUpdates = { ...updates };
    if (processedUpdates.baseNetFare !== undefined) {
      processedUpdates.baseNetFare = processedUpdates.baseNetFare.toString() as any;
    }

    const [updatedFare] = await db
      .update(negotiatedFares)
      .set({ ...processedUpdates, updatedAt: sql`now()` })
      .where(eq(negotiatedFares.id, id))
      .returning();
    return updatedFare;
  }

  async updateNegotiatedFareStatus(id: string, status: string): Promise<NegotiatedFare> {
    const [updatedFare] = await db
      .update(negotiatedFares)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(negotiatedFares.id, id))
      .returning();
    return updatedFare;
  }

  async deleteNegotiatedFare(id: string): Promise<void> {
    await db.delete(negotiatedFares).where(eq(negotiatedFares.id, id));
  }

  async checkFareConflicts(fare: InsertNegotiatedFare): Promise<NegotiatedFare[]> {
    // Check for overlapping fares with same origin/destination/cabin class
    const conflicts = await db
      .select()
      .from(negotiatedFares)
      .where(
        and(
          eq(negotiatedFares.airlineCode, fare.airlineCode),
          eq(negotiatedFares.origin, fare.origin),
          eq(negotiatedFares.destination, fare.destination),
          eq(negotiatedFares.cabinClass, fare.cabinClass),
          or(
            // Booking date overlaps
            and(
              sql`${negotiatedFares.bookingStartDate} <= ${fare.bookingEndDate}`,
              sql`${negotiatedFares.bookingEndDate} >= ${fare.bookingStartDate}`
            ),
            // Travel date overlaps
            and(
              sql`${negotiatedFares.travelStartDate} <= ${fare.travelEndDate}`,
              sql`${negotiatedFares.travelEndDate} >= ${fare.travelStartDate}`
            )
          )
        )
      );

    return conflicts;
  }

  // Dynamic Discount Rules methods
  async getDynamicDiscountRules(filters: any = {}): Promise<InsertDynamicDiscountRule[]> {
    let query = db.select().from(dynamicDiscountRules);

    const conditions: any[] = [];

    if (filters.ruleCode) {
      conditions.push(ilike(dynamicDiscountRules.ruleCode, `%${filters.ruleCode}%`));
    }
    if (filters.fareSource) {
      conditions.push(eq(dynamicDiscountRules.fareSource, filters.fareSource));
    }
    if (filters.origin) {
      conditions.push(eq(dynamicDiscountRules.origin, filters.origin));
    }
    if (filters.destination) {
      conditions.push(eq(dynamicDiscountRules.destination, filters.destination));
    }
    if (filters.status) {
      conditions.push(eq(dynamicDiscountRules.status, filters.status));
    }
    if (filters.channel) {
      conditions.push(eq(dynamicDiscountRules.channel, filters.channel));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(dynamicDiscountRules.priority, dynamicDiscountRules.createdAt);
  }

  async getDynamicDiscountRuleById(id: string): Promise<InsertDynamicDiscountRule | undefined> {
    const result = await db.select().from(dynamicDiscountRules).where(eq(dynamicDiscountRules.id, id));
    return result[0] || undefined;
  }

  async insertDynamicDiscountRule(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule> {
    const result = await db.insert(dynamicDiscountRules).values(rule).returning();
    return result[0];
  }

  async updateDynamicDiscountRule(id: string, rule: Partial<InsertDynamicDiscountRule>): Promise<InsertDynamicDiscountRule> {
    const result = await db.update(dynamicDiscountRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(dynamicDiscountRules.id, id))
      .returning();
    return result[0];
  }

  async updateDynamicDiscountRuleStatus(id: string, status: string): Promise<InsertDynamicDiscountRule> {
    const result = await db.update(dynamicDiscountRules)
      .set({ status, updatedAt: new Date() })
      .where(eq(dynamicDiscountRules.id, id))
      .returning();
    return result[0];
  }

  async deleteDynamicDiscountRule(id: string): Promise<void> {
    return await db.delete(dynamicDiscountRules).where(eq(dynamicDiscountRules.id, id));
  }

  async checkDiscountRuleConflicts(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule[]> {
    const conflicts = await db.select()
      .from(dynamicDiscountRules)
      .where(
        and(
          eq(dynamicDiscountRules.ruleCode, rule.ruleCode),
          eq(dynamicDiscountRules.status, "ACTIVE")
        )
      );

    return conflicts;
  }

  // Air Ancillary Rules methods
  async getAirAncillaryRules(filters: any = {}): Promise<InsertAirAncillaryRule[]> {
    let query = db.select().from(airAncillaryRules);

    const conditions: any[] = [];

    if (filters.ruleCode) {
      conditions.push(ilike(airAncillaryRules.ruleCode, `%${filters.ruleCode}%`));
    }
    if (filters.ancillaryCode) {
      conditions.push(eq(airAncillaryRules.ancillaryCode, filters.ancillaryCode));
    }
    if (filters.airlineCode) {
      conditions.push(eq(airAncillaryRules.airlineCode, filters.airlineCode));
    }
    if (filters.origin) {
      conditions.push(eq(airAncillaryRules.origin, filters.origin));
    }
    if (filters.destination) {
      conditions.push(eq(airAncillaryRules.destination, filters.destination));
    }
    if (filters.status) {
      conditions.push(eq(airAncillaryRules.status, filters.status));
    }
    if (filters.channel) {
      conditions.push(eq(airAncillaryRules.channel, filters.channel));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(airAncillaryRules.priority, airAncillaryRules.createdAt);
  }

  async getAirAncillaryRuleById(id: string): Promise<InsertAirAncillaryRule | undefined> {
    const result = await db.select().from(airAncillaryRules).where(eq(airAncillaryRules.id, id));
    return result[0] || undefined;
  }

  async insertAirAncillaryRule(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule> {
    const result = await db.insert(airAncillaryRules).values(rule).returning();
    return result[0];
  }

  async updateAirAncillaryRule(id: string, rule: Partial<InsertAirAncillaryRule>): Promise<InsertAirAncillaryRule> {
    const result = await db.update(airAncillaryRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(airAncillaryRules.id, id))
      .returning();
    return result[0];
  }

  async updateAirAncillaryRuleStatus(id: string, status: string): Promise<InsertAirAncillaryRule> {
    const result = await db.update(airAncillaryRules)
      .set({ status, updatedAt: new Date() })
      .where(eq(airAncillaryRules.id, id))
      .returning();
    return result[0];
  }

  async deleteAirAncillaryRule(id: string): Promise<void> {
    return await db.delete(airAncillaryRules).where(eq(airAncillaryRules.id, id));
  }

  async checkAirAncillaryRuleConflicts(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule[]> {
    const conflicts = await db.select()
      .from(airAncillaryRules)
      .where(
        and(
          eq(airAncillaryRules.ruleCode, rule.ruleCode),
          eq(airAncillaryRules.status, "ACTIVE")
        )
      );

    return conflicts;
  }

  // Non-Air Ancillary Rate methods
  async insertNonAirRate(rate: InsertNonAirRate): Promise<InsertNonAirRate> {
    const [insertedRate] = await db.insert(nonAirRates).values(rate).returning();
    return insertedRate;
  }

  async getNonAirRates(filters: any = {}): Promise<InsertNonAirRate[]> {
    let query = db.select().from(nonAirRates);
    const conditions: any[] = [];

    if (filters.supplierCode) {
      conditions.push(eq(nonAirRates.supplierCode, filters.supplierCode));
    }
    if (filters.productCode) {
      conditions.push(eq(nonAirRates.productCode, filters.productCode));
    }
    if (filters.region) {
      conditions.push(inArray(nonAirRates.region, filters.region));
    }
    if (filters.validFrom) {
      conditions.push(gte(nonAirRates.validFrom, filters.validFrom));
    }
    if (filters.validTo) {
      conditions.push(lte(nonAirRates.validTo, filters.validTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getNonAirRateById(id: string): Promise<InsertNonAirRate | undefined> {
    const [rate] = await db.select().from(nonAirRates).where(eq(nonAirRates.id, id));
    return rate;
  }

  async updateNonAirRate(id: string, rate: Partial<InsertNonAirRate>): Promise<InsertNonAirRate> {
    const [updatedRate] = await db
      .update(nonAirRates)
      .set({ ...rate, updatedAt: sql`now()` })
      .where(eq(nonAirRates.id, id))
      .returning();
    return updatedRate;
  }

  async deleteNonAirRate(id: string): Promise<void> {
    await db.delete(nonAirRates).where(eq(nonAirRates.id, id));
  }

  // Non-Air Markup Rule methods
  async insertNonAirMarkupRule(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule> {
    const [insertedRule] = await db.insert(nonAirMarkupRules).values(rule).returning();
    return insertedRule;
  }

  async getNonAirMarkupRules(filters: any = {}): Promise<InsertNonAirMarkupRule[]> {
    let query = db.select().from(nonAirMarkupRules);
    const conditions: any[] = [];

    if (filters.ruleCode) {
      conditions.push(eq(nonAirMarkupRules.ruleCode, filters.ruleCode));
    }
    if (filters.supplierCode) {
      conditions.push(eq(nonAirMarkupRules.supplierCode, filters.supplierCode));
    }
    if (filters.productCode) {
      conditions.push(eq(nonAirMarkupRules.productCode, filters.productCode));
    }
    if (filters.pos) {
      conditions.push(inArray(nonAirMarkupRules.pos, filters.pos));
    }
    if (filters.agentTier) {
      conditions.push(inArray(nonAirMarkupRules.agentTier, filters.agentTier));
    }
    if (filters.channel) {
      conditions.push(eq(nonAirMarkupRules.channel, filters.channel));
    }
    if (filters.status) {
      conditions.push(eq(nonAirMarkupRules.status, filters.status));
    }
    if (filters.validFrom) {
      conditions.push(gte(nonAirMarkupRules.validFrom, filters.validFrom));
    }
    if (filters.validTo) {
      conditions.push(lte(nonAirMarkupRules.validTo, filters.validTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(nonAirMarkupRules.priority, nonAirMarkupRules.createdAt);
  }

  async getNonAirMarkupRuleById(id: string): Promise<InsertNonAirMarkupRule | undefined> {
    const [rule] = await db.select().from(nonAirMarkupRules).where(eq(nonAirMarkupRules.id, id));
    return rule;
  }

  async updateNonAirMarkupRule(id: string, rule: Partial<InsertNonAirMarkupRule>): Promise<InsertNonAirMarkupRule> {
    const [updatedRule] = await db
      .update(nonAirMarkupRules)
      .set({ ...rule, updatedAt: sql`now()` })
      .where(eq(nonAirMarkupRules.id, id))
      .returning();
    return updatedRule;
  }

  async updateNonAirMarkupRuleStatus(id: string, status: string): Promise<InsertNonAirMarkupRule> {
    const [updatedRule] = await db
      .update(nonAirMarkupRules)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(nonAirMarkupRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteNonAirMarkupRule(id: string): Promise<void> {
    await db.delete(nonAirMarkupRules).where(eq(nonAirMarkupRules.id, id));
  }

  async checkNonAirMarkupRuleConflicts(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule[]> {
    const conflicts = await db.select()
      .from(nonAirMarkupRules)
      .where(
        and(
          eq(nonAirMarkupRules.ruleCode, rule.ruleCode),
          eq(nonAirMarkupRules.status, "ACTIVE")
        )
      );
    return conflicts;
  }
}

export const storage = new DatabaseStorage();