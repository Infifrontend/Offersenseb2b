import { users, negotiatedFares, dynamicDiscountRules, airAncillaryRules, nonAirRates, nonAirMarkupRules, bundles, bundlePricingRules, offerRules, offerTraces, agents, channelPricingOverrides } from "../shared/schema";
import type { 
  InsertUser, 
  User, 
  NegotiatedFare, 
  InsertNegotiatedFare, 
  DynamicDiscountRule, 
  InsertDynamicDiscountRule,
  AirAncillaryRule,
  InsertAirAncillaryRule,
  NonAirRate,
  InsertNonAirRate,
  NonAirMarkupRule,
  InsertNonAirMarkupRule,
  Bundle,
  InsertBundle,
  BundlePricingRule,
  InsertBundlePricingRule,
  OfferRule,
  InsertOfferRule,
  OfferTrace,
  InsertOfferTrace,
  Agent,
  InsertAgent,
  ChannelPricingOverride,
  InsertChannelPricingOverride
} from "../shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, ilike, inArray, sql, desc } from "drizzle-orm";


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

  // Bundles
  insertBundle(bundle: InsertBundle): Promise<InsertBundle>;
  getBundles(filters?: any): Promise<InsertBundle[]>;
  getBundleById(id: string): Promise<InsertBundle | undefined>;
  updateBundle(id: string, bundle: Partial<InsertBundle>): Promise<InsertBundle>;
  updateBundleStatus(id: string, status: string): Promise<InsertBundle>;
  deleteBundle(id: string): Promise<void>;
  checkBundleConflicts(bundle: InsertBundle): Promise<InsertBundle[]>;

  // Bundle Pricing Rules
  insertBundlePricingRule(rule: InsertBundlePricingRule): Promise<InsertBundlePricingRule>;
  getBundlePricingRules(filters?: any): Promise<InsertBundlePricingRule[]>;
  getBundlePricingRuleById(id: string): Promise<InsertBundlePricingRule | undefined>;
  updateBundlePricingRule(id: string, rule: Partial<InsertBundlePricingRule>): Promise<InsertBundlePricingRule>;
  updateBundlePricingRuleStatus(id: string, status: string): Promise<InsertBundlePricingRule>;
  deleteBundlePricingRule(id: string): Promise<void>;
  checkBundlePricingRuleConflicts(rule: InsertBundlePricingRule): Promise<InsertBundlePricingRule[]>;

  // Offer Rules
  getOfferRules(filters?: any): Promise<OfferRule[]>;
  getOfferRuleById(id: string): Promise<OfferRule | null>;
  insertOfferRule(rule: InsertOfferRule): Promise<OfferRule>;
  updateOfferRule(id: string, rule: InsertOfferRule): Promise<OfferRule>;
  updateOfferRuleStatus(id: string, status: string, approver?: string): Promise<OfferRule>;
  deleteOfferRule(id: string): Promise<void>;
  checkOfferRuleConflicts(rule: InsertOfferRule): Promise<OfferRule[]>;

  // Offer Composition Methods
  insertOfferTrace(trace: InsertOfferTrace): Promise<OfferTrace>;
  getOfferTraces(filters?: any): Promise<OfferTrace[]>;
  getOfferTraceById(id: string): Promise<OfferTrace | undefined>;
  getOfferTraceByTraceId(traceId: string): Promise<OfferTrace | undefined>;
  updateOfferTrace(id: string, updates: Partial<InsertOfferTrace>): Promise<OfferTrace>;
  deleteOfferTrace(id: string): Promise<void>;

  // Agent operations
  getAgents(filters?: any): Promise<Agent[]>;
  insertAgent(agentData: InsertAgent): Promise<Agent>;
  getAgentById(id: string): Promise<Agent | null>;
  getAgentByAgentId(agentId: string): Promise<Agent | null>;
  updateAgent(id: string, agentData: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: string, status: string): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;
  checkAgentConflicts(agentData: InsertAgent): Promise<any[]>;

  // Channel Pricing Override operations
  getChannelPricingOverrides(filters?: any): Promise<ChannelPricingOverride[]>;
  insertChannelPricingOverride(overrideData: InsertChannelPricingOverride): Promise<ChannelPricingOverride>;
  getChannelPricingOverrideById(id: string): Promise<ChannelPricingOverride | null>;
  updateChannelPricingOverride(id: string, overrideData: InsertChannelPricingOverride): Promise<ChannelPricingOverride>;
  updateChannelPricingOverrideStatus(id: string, status: string): Promise<ChannelPricingOverride>;
  deleteChannelPricingOverride(id: string): Promise<void>;
  checkChannelPricingOverrideConflicts(overrideData: InsertChannelPricingOverride): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  private db = db;

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
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

    const [newFare] = await this.db.insert(negotiatedFares).values(processedFare).returning();
    return newFare;
  }

  async getNegotiatedFares(filters: any = {}): Promise<NegotiatedFare[]> {
    let query = this.db.select().from(negotiatedFares);

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
    const [fare] = await this.db.select().from(negotiatedFares).where(eq(negotiatedFares.id, id));
    return fare || undefined;
  }

  async updateNegotiatedFare(id: string, updates: Partial<InsertNegotiatedFare>): Promise<NegotiatedFare> {
    // Convert number baseNetFare to string for PostgreSQL decimal type
    const processedUpdates = { ...updates };
    if (processedUpdates.baseNetFare !== undefined) {
      processedUpdates.baseNetFare = processedUpdates.baseNetFare.toString() as any;
    }

    const [updatedFare] = await this.db
      .update(negotiatedFares)
      .set({ ...processedUpdates, updatedAt: sql`now()` })
      .where(eq(negotiatedFares.id, id))
      .returning();
    return updatedFare;
  }

  async updateNegotiatedFareStatus(id: string, status: string): Promise<NegotiatedFare> {
    const [updatedFare] = await this.db
      .update(negotiatedFares)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(negotiatedFares.id, id))
      .returning();
    return updatedFare;
  }

  async deleteNegotiatedFare(id: string): Promise<void> {
    await this.db.delete(negotiatedFares).where(eq(negotiatedFares.id, id));
  }

  async checkFareConflicts(fare: InsertNegotiatedFare): Promise<NegotiatedFare[]> {
    // Check for overlapping fares with same origin/destination/cabin class
    const conflicts = await this.db
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
    let query = this.db.select().from(dynamicDiscountRules);

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
    const result = await this.db.select().from(dynamicDiscountRules).where(eq(dynamicDiscountRules.id, id));
    return result[0] || undefined;
  }

  async insertDynamicDiscountRule(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule> {
    const result = await this.db.insert(dynamicDiscountRules).values(rule).returning();
    return result[0];
  }

  async updateDynamicDiscountRule(id: string, rule: Partial<InsertDynamicDiscountRule>): Promise<InsertDynamicDiscountRule> {
    const result = await this.db.update(dynamicDiscountRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(dynamicDiscountRules.id, id))
      .returning();
    return result[0];
  }

  async updateDynamicDiscountRuleStatus(id: string, status: string): Promise<InsertDynamicDiscountRule> {
    const result = await this.db.update(dynamicDiscountRules)
      .set({ status, updatedAt: new Date() })
      .where(eq(dynamicDiscountRules.id, id))
      .returning();
    return result[0];
  }

  async deleteDynamicDiscountRule(id: string): Promise<void> {
    return await this.db.delete(dynamicDiscountRules).where(eq(dynamicDiscountRules.id, id));
  }

  async checkDiscountRuleConflicts(rule: InsertDynamicDiscountRule): Promise<InsertDynamicDiscountRule[]> {
    const conflicts = await this.db.select()
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
    let query = this.db.select().from(airAncillaryRules);

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
    const result = await this.db.select().from(airAncillaryRules).where(eq(airAncillaryRules.id, id));
    return result[0] || undefined;
  }

  async insertAirAncillaryRule(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule> {
    const result = await this.db.insert(airAncillaryRules).values(rule).returning();
    return result[0];
  }

  async updateAirAncillaryRule(id: string, rule: Partial<InsertAirAncillaryRule>): Promise<InsertAirAncillaryRule> {
    const result = await this.db.update(airAncillaryRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(airAncillaryRules.id, id))
      .returning();
    return result[0];
  }

  async updateAirAncillaryRuleStatus(id: string, status: string): Promise<InsertAirAncillaryRule> {
    const result = await this.db.update(airAncillaryRules)
      .set({ status, updatedAt: new Date() })
      .where(eq(airAncillaryRules.id, id))
      .returning();
    return result[0];
  }

  async deleteAirAncillaryRule(id: string): Promise<void> {
    return await this.db.delete(airAncillaryRules).where(eq(airAncillaryRules.id, id));
  }

  async checkAirAncillaryRuleConflicts(rule: InsertAirAncillaryRule): Promise<InsertAirAncillaryRule[]> {
    const conflicts = await this.db.select()
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
    const [insertedRate] = await this.db.insert(nonAirRates).values(rate).returning();
    return insertedRate;
  }

  async getNonAirRates(filters: any = {}): Promise<InsertNonAirRate[]> {
    let query = this.db.select().from(nonAirRates);
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
    const [rate] = await this.db.select().from(nonAirRates).where(eq(nonAirRates.id, id));
    return rate;
  }

  async updateNonAirRate(id: string, rate: Partial<InsertNonAirRate>): Promise<InsertNonAirRate> {
    const [updatedRate] = await this.db
      .update(nonAirRates)
      .set({ ...rate, updatedAt: sql`now()` })
      .where(eq(nonAirRates.id, id))
      .returning();
    return updatedRate;
  }

  async deleteNonAirRate(id: string): Promise<void> {
    await this.db.delete(nonAirRates).where(eq(nonAirRates.id, id));
  }

  // Non-Air Markup Rule methods
  async insertNonAirMarkupRule(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule> {
    const [insertedRule] = await this.db.insert(nonAirMarkupRules).values(rule).returning();
    return insertedRule;
  }

  async getNonAirMarkupRules(filters: any = {}): Promise<InsertNonAirMarkupRule[]> {
    let query = this.db.select().from(nonAirMarkupRules);
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
    const [rule] = await this.db.select().from(nonAirMarkupRules).where(eq(nonAirMarkupRules.id, id));
    return rule;
  }

  async updateNonAirMarkupRule(id: string, rule: Partial<InsertNonAirMarkupRule>): Promise<InsertNonAirMarkupRule> {
    const [updatedRule] = await this.db
      .update(nonAirMarkupRules)
      .set({ ...rule, updatedAt: sql`now()` })
      .where(eq(nonAirMarkupRules.id, id))
      .returning();
    return updatedRule;
  }

  async updateNonAirMarkupRuleStatus(id: string, status: string): Promise<InsertNonAirMarkupRule> {
    const [updatedRule] = await this.db
      .update(nonAirMarkupRules)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(nonAirMarkupRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteNonAirMarkupRule(id: string): Promise<void> {
    await this.db.delete(nonAirMarkupRules).where(eq(nonAirMarkupRules.id, id));
  }

  async checkNonAirMarkupRuleConflicts(rule: InsertNonAirMarkupRule): Promise<InsertNonAirMarkupRule[]> {
    const conflicts = await this.db.select()
      .from(nonAirMarkupRules)
      .where(
        and(
          eq(nonAirMarkupRules.ruleCode, rule.ruleCode),
          eq(nonAirMarkupRules.status, "ACTIVE")
        )
      );
    return conflicts;
  }

  // Bundle methods
  async insertBundle(bundle: InsertBundle): Promise<InsertBundle> {
    const [insertedBundle] = await this.db.insert(bundles).values(bundle).returning();
    return insertedBundle;
  }

  async getBundles(filters: any = {}): Promise<InsertBundle[]> {
    let query = this.db.select().from(bundles);
    const conditions: any[] = [];

    if (filters.bundleCode) {
      conditions.push(ilike(bundles.bundleCode, `%${filters.bundleCode}%`));
    }
    if (filters.bundleType) {
      conditions.push(eq(bundles.bundleType, filters.bundleType));
    }
    if (filters.status) {
      conditions.push(eq(bundles.status, filters.status));
    }
    if (filters.channel) {
      conditions.push(eq(bundles.channel, filters.channel));
    }
    if (filters.validFrom) {
      conditions.push(gte(bundles.validFrom, filters.validFrom));
    }
    if (filters.validTo) {
      conditions.push(lte(bundles.validTo, filters.validTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(bundles.createdAt);
  }

  async getBundleById(id: string): Promise<InsertBundle | undefined> {
    const [bundle] = await this.db.select().from(bundles).where(eq(bundles.id, id));
    return bundle;
  }

  async updateBundle(id: string, bundle: Partial<InsertBundle>): Promise<InsertBundle> {
    const [updatedBundle] = await this.db
      .update(bundles)
      .set({ ...bundle, updatedAt: sql`now()` })
      .where(eq(bundles.id, id))
      .returning();
    return updatedBundle;
  }

  async updateBundleStatus(id: string, status: string): Promise<InsertBundle> {
    const [updatedBundle] = await this.db
      .update(bundles)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(bundles.id, id))
      .returning();
    return updatedBundle;
  }

  async deleteBundle(id: string): Promise<void> {
    await this.db.delete(bundles).where(eq(bundles.id, id));
  }

  async checkBundleConflicts(bundle: InsertBundle): Promise<InsertBundle[]> {
    const conflicts = await this.db.select()
      .from(bundles)
      .where(
        and(
          eq(bundles.bundleCode, bundle.bundleCode),
          eq(bundles.status, "ACTIVE")
        )
      );
    return conflicts;
  }

  // Bundle Pricing Rule methods
  async insertBundlePricingRule(rule: InsertBundlePricingRule): Promise<InsertBundlePricingRule> {
    const [insertedRule] = await this.db.insert(bundlePricingRules).values(rule).returning();
    return insertedRule;
  }

  async getBundlePricingRules(filters: any = {}): Promise<InsertBundlePricingRule[]> {
    let query = this.db.select().from(bundlePricingRules);
    const conditions: any[] = [];

    if (filters.ruleCode) {
      conditions.push(ilike(bundlePricingRules.ruleCode, `%${filters.ruleCode}%`));
    }
    if (filters.bundleCode) {
      conditions.push(eq(bundlePricingRules.bundleCode, filters.bundleCode));
    }
    if (filters.status) {
      conditions.push(eq(bundlePricingRules.status, filters.status));
    }
    if (filters.validFrom) {
      conditions.push(gte(bundlePricingRules.validFrom, filters.validFrom));
    }
    if (filters.validTo) {
      conditions.push(lte(bundlePricingRules.validTo, filters.validTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(bundlePricingRules.priority, bundlePricingRules.createdAt);
  }

  async getBundlePricingRuleById(id: string): Promise<InsertBundlePricingRule | undefined> {
    const [rule] = await this.db.select().from(bundlePricingRules).where(eq(bundlePricingRules.id, id));
    return rule;
  }

  async updateBundlePricingRule(id: string, rule: Partial<InsertBundlePricingRule>): Promise<InsertBundlePricingRule> {
    const [updatedRule] = await this.db
      .update(bundlePricingRules)
      .set({ ...rule, updatedAt: sql`now()` })
      .where(eq(bundlePricingRules.id, id))
      .returning();
    return updatedRule;
  }

  async updateBundlePricingRuleStatus(id: string, status: string): Promise<InsertBundlePricingRule> {
    const [updatedRule] = await this.db
      .update(bundlePricingRules)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(bundlePricingRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteBundlePricingRule(id: string): Promise<void> {
    await this.db.delete(bundlePricingRules).where(eq(bundlePricingRules.id, id));
  }

  async checkBundlePricingRuleConflicts(rule: InsertBundlePricingRule): Promise<InsertBundlePricingRule[]> {
    const conflicts = await this.db.select()
      .from(bundlePricingRules)
      .where(
        and(
          eq(bundlePricingRules.ruleCode, rule.ruleCode),
          eq(bundlePricingRules.status, "ACTIVE")
        )
      );
    return conflicts;
  }

  // Offer Rules
  async getOfferRules(filters: any = {}): Promise<OfferRule[]> {
    let query = this.db.select().from(offerRules);
    const conditions: any[] = [];

    if (filters.ruleCode) {
      conditions.push(eq(offerRules.ruleCode, filters.ruleCode));
    }
    if (filters.ruleType) {
      conditions.push(eq(offerRules.ruleType, filters.ruleType));
    }
    if (filters.status) {
      conditions.push(eq(offerRules.status, filters.status));
    }
    if (filters.createdBy) {
      conditions.push(eq(offerRules.createdBy, filters.createdBy));
    }
    if (filters.approvedBy) {
      conditions.push(eq(offerRules.approvedBy, filters.approvedBy));
    }
    if (filters.validFrom) {
      conditions.push(gte(offerRules.validFrom, filters.validFrom));
    }
    if (filters.validTo) {
      conditions.push(lte(offerRules.validTo, filters.validTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(offerRules.priority, offerRules.createdAt);
  }

  async getOfferRuleById(id: string): Promise<OfferRule | null> {
    const result = await this.db.select().from(offerRules).where(eq(offerRules.id, id));
    return result[0] || null;
  }

  async insertOfferRule(rule: InsertOfferRule): Promise<OfferRule> {
    const result = await this.db.insert(offerRules).values(rule).returning();
    return result[0];
  }

  async updateOfferRule(id: string, rule: InsertOfferRule): Promise<OfferRule> {
    const result = await this.db.update(offerRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(offerRules.id, id))
      .returning();
    return result[0];
  }

  async updateOfferRuleStatus(id: string, status: string, approver?: string): Promise<OfferRule> {
    const updateData: any = { status, updatedAt: new Date() };

    if (status === "ACTIVE" && approver) {
      updateData.approvedBy = approver;
      updateData.approvedAt = new Date();
    }

    const result = await this.db.update(offerRules)
      .set(updateData)
      .where(eq(offerRules.id, id))
      .returning();
    return result[0];
  }

  async deleteOfferRule(id: string): Promise<void> {
    await this.db.delete(offerRules).where(eq(offerRules.id, id));
  }

  async checkOfferRuleConflicts(rule: InsertOfferRule): Promise<OfferRule[]> {
    // Check for overlapping rules with same conditions and actions
    const existingRules = await this.db.select().from(offerRules)
      .where(and(
        eq(offerRules.ruleType, rule.ruleType),
        eq(offerRules.status, "ACTIVE"),
        gte(offerRules.validTo, rule.validFrom),
        lte(offerRules.validFrom, rule.validTo)
      ));

    // Basic conflict detection - can be enhanced with more sophisticated logic
    const conflicts = existingRules.filter(existing => {
      const existingConditions = existing.conditions as any;
      const newConditions = rule.conditions as any;

      // Check for overlapping conditions
      const hasOverlap = (
        (!existingConditions.pos && !newConditions.pos) ||
        (existingConditions.pos && newConditions.pos && 
         existingConditions.pos.some((p: string) => newConditions.pos.includes(p))) ||
        (!existingConditions.agentTier && !newConditions.agentTier) ||
        (existingConditions.agentTier && newConditions.agentTier && 
         existingConditions.agentTier.some((t: string) => newConditions.agentTier.includes(t)))
      );

      return hasOverlap;
    });

    return conflicts;
  }

  // Offer Composition Methods
  async insertOfferTrace(trace: InsertOfferTrace): Promise<OfferTrace> {
    const [result] = await this.db.insert(offerTraces).values(trace).returning();
    return result;
  }

  async getOfferTraces(filters: any = {}): Promise<OfferTrace[]> {
    let query = this.db.select().from(offerTraces);

    const conditions = [];

    if (filters.agentId) {
      conditions.push(eq(offerTraces.agentId, filters.agentId));
    }

    if (filters.fareSource) {
      conditions.push(eq(offerTraces.fareSource, filters.fareSource));
    }

    if (filters.status) {
      conditions.push(eq(offerTraces.status, filters.status));
    }

    if (filters.agentTier) {
      conditions.push(eq(offerTraces.agentTier, filters.agentTier));
    }

    if (filters.dateFrom) {
      conditions.push(gte(offerTraces.createdAt, new Date(filters.dateFrom)));
    }

    if (filters.dateTo) {
      conditions.push(lte(offerTraces.createdAt, new Date(filters.dateTo)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(sql`${offerTraces.createdAt} DESC`);
  }

  async getOfferTraceById(id: string): Promise<OfferTrace | undefined> {
    const [result] = await this.db.select().from(offerTraces).where(eq(offerTraces.id, id));
    return result;
  }

  async getOfferTraceByTraceId(traceId: string): Promise<OfferTrace | undefined> {
    const [result] = await this.db.select().from(offerTraces).where(eq(offerTraces.traceId, traceId));
    return result;
  }

  async updateOfferTrace(id: string, updates: Partial<InsertOfferTrace>): Promise<OfferTrace> {
    const [result] = await this.db
      .update(offerTraces)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(offerTraces.id, id))
      .returning();
    return result;
  }

  async deleteOfferTrace(id: string): Promise<void> {
    await this.db.delete(offerTraces).where(eq(offerTraces.id, id));
  }

  // Agent operations
  async getAgents(filters: any = {}): Promise<Agent[]> {
    let query = this.db.select().from(agents);
    const conditions = [];

    if (filters.agentId) {
      conditions.push(eq(agents.agentId, filters.agentId));
    }
    if (filters.tier) {
      conditions.push(eq(agents.tier, filters.tier));
    }
    if (filters.status) {
      conditions.push(eq(agents.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async insertAgent(agentData: InsertAgent): Promise<Agent> {
    const [agent] = await this.db.insert(agents).values(agentData).returning();
    return agent;
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const [agent] = await this.db.select().from(agents).where(eq(agents.id, id));
    return agent || null;
  }

  async getAgentByAgentId(agentId: string): Promise<Agent | null> {
    const [agent] = await this.db.select().from(agents).where(eq(agents.agentId, agentId));
    return agent || null;
  }

  async updateAgent(id: string, agentData: InsertAgent): Promise<Agent> {
    const [agent] = await this.db
      .update(agents)
      .set({ ...agentData, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent;
  }

  async updateAgentStatus(id: string, status: string): Promise<Agent> {
    const [agent] = await this.db
      .update(agents)
      .set({ status, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.db.delete(agents).where(eq(agents.id, id));
  }

  async checkAgentConflicts(agentData: InsertAgent): Promise<any[]> {
    // Check for existing agent with same agentId
    const existingAgent = await this.getAgentByAgentId(agentData.agentId);
    const conflicts = [];

    if (existingAgent) {
      conflicts.push({
        type: 'DUPLICATE_AGENT_ID',
        message: `Agent with ID ${agentData.agentId} already exists`,
        conflictingAgent: existingAgent
      });
    }

    return conflicts;
  }

  // Channel Pricing Override operations
  async getChannelPricingOverrides(filters: any = {}): Promise<ChannelPricingOverride[]> {
    let query = this.db.select().from(channelPricingOverrides);
    const conditions = [];

    if (filters.channel) {
      conditions.push(eq(channelPricingOverrides.channel, filters.channel));
    }
    if (filters.productScope) {
      conditions.push(eq(channelPricingOverrides.productScope, filters.productScope));
    }
    if (filters.status) {
      conditions.push(eq(channelPricingOverrides.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(channelPricingOverrides.priority));
  }

  async insertChannelPricingOverride(overrideData: InsertChannelPricingOverride): Promise<ChannelPricingOverride> {
    const [override] = await this.db.insert(channelPricingOverrides).values(overrideData).returning();
    return override;
  }

  async getChannelPricingOverrideById(id: string): Promise<ChannelPricingOverride | null> {
    const [override] = await this.db.select().from(channelPricingOverrides).where(eq(channelPricingOverrides.id, id));
    return override || null;
  }

  async updateChannelPricingOverride(id: string, overrideData: InsertChannelPricingOverride): Promise<ChannelPricingOverride> {
    const [override] = await this.db
      .update(channelPricingOverrides)
      .set({ ...overrideData, updatedAt: new Date() })
      .where(eq(channelPricingOverrides.id, id))
      .returning();
    return override;
  }

  async updateChannelPricingOverrideStatus(id: string, status: string): Promise<ChannelPricingOverride> {
    const [override] = await this.db
      .update(channelPricingOverrides)
      .set({ status, updatedAt: new Date() })
      .where(eq(channelPricingOverrides.id, id))
      .returning();
    return override;
  }

  async deleteChannelPricingOverride(id: string): Promise<void> {
    await this.db.delete(channelPricingOverrides).where(eq(channelPricingOverrides.id, id));
  }

  async checkChannelPricingOverrideConflicts(overrideData: InsertChannelPricingOverride): Promise<any[]> {
    // Check for overlapping overrides
    const existingOverrides = await this.db
      .select()
      .from(channelPricingOverrides)
      .where(
        and(
          eq(channelPricingOverrides.channel, overrideData.channel),
          eq(channelPricingOverrides.productScope, overrideData.productScope),
          eq(channelPricingOverrides.status, "ACTIVE")
        )
      );

    const conflicts = [];
    for (const existing of existingOverrides) {
      // Check for date overlaps
      const existingStart = new Date(existing.validFrom);
      const existingEnd = new Date(existing.validTo);
      const newStart = new Date(overrideData.validFrom);
      const newEnd = new Date(overrideData.validTo);

      if (newStart <= existingEnd && newEnd >= existingStart) {
        conflicts.push({
          type: 'DATE_OVERLAP',
          message: `Override conflicts with existing override ${existing.overrideCode}`,
          conflictingOverride: existing
        });
      }
    }

    return conflicts;
  }
};

export const storage = new DatabaseStorage();