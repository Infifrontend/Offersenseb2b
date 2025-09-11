import { users, negotiatedFares, dynamicDiscountRules, airAncillaryRules, nonAirRates, nonAirMarkupRules, bundles, bundlePricingRules, offerRules, offerTraces, agents, channelPricingOverrides, cohorts, auditLogs, agentTiers, agentTierAssignments, tierAssignmentEngine, campaigns, campaignMetrics, campaignDeliveries, type InsertUser, type InsertNegotiatedFare, type InsertDynamicDiscountRule, type InsertAirAncillaryRule, type InsertNonAirRate, type InsertNonAirMarkupRule, type InsertBundle, type InsertBundlePricingRule, type InsertOfferRule, type InsertOfferTrace, type InsertAgent, type InsertChannelPricingOverride, type InsertCohort, type InsertAuditLog, type InsertAgentTier, type InsertAgentTierAssignment, type InsertTierAssignmentEngine, type InsertCampaign, type InsertCampaignMetrics, type InsertCampaignDelivery } from "../shared/schema";
import type {
  User,
  NegotiatedFare,
  DynamicDiscountRule,
  AirAncillaryRule,
  NonAirRate,
  NonAirMarkupRule,
  Bundle,
  BundlePricingRule,
  OfferRule,
  OfferTrace,
  Agent,
  ChannelPricingOverride,
  Cohort,
  AgentTier,
  AgentTierAssignment,
  TierAssignmentEngine,
  Campaign,
  CampaignMetrics,
  CampaignDelivery,
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
  updateNegotiatedFareStatus(id: string, status: string): Promise<NegotiatedFare>;
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

  // Cohort operations
  getCohorts(filters?: any): Promise<Cohort[]>;
  insertCohort(cohortData: InsertCohort): Promise<Cohort>;
  getCohortById(id: string): Promise<Cohort | null>;
  getCohortByCode(cohortCode: string): Promise<Cohort | null>;
  updateCohort(id: string, cohortData: InsertCohort): Promise<Cohort>;
  updateCohortStatus(id: string, status: string): Promise<Cohort>;
  deleteCohort(id: string): Promise<void>;
  checkCohortConflicts(cohortData: InsertCohort): Promise<any[]>;

  // Audit Log Methods
  getAuditLogs(filters?: any): Promise<InsertAuditLog[]>;
  getAuditLogById(id: string): Promise<InsertAuditLog | null>;
  getAuditLogsByEntity(entityId: string, module?: string): Promise<InsertAuditLog[]>;
  insertAuditLog(data: InsertAuditLog): Promise<InsertAuditLog>;
  deleteAuditLog(id: string): Promise<void>;
  createAuditLog(params: {
    user: string;
    module: string;
    entityId: string;
    action: string;
    beforeData?: any;
    afterData?: any;
    justification?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<InsertAuditLog>;
  withAuditLog<T>(
    operation: () => Promise<T>,
    auditParams: {
      user: string;
      module: string;
      entityId: string;
      action: string;
      justification?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    },
    getBeforeData?: () => Promise<any>
  ): Promise<T>;

  // Agent Tier Management operations
  getAgentTiers(filters?: any): Promise<AgentTier[]>;
  insertAgentTier(tierData: InsertAgentTier): Promise<AgentTier>;
  getAgentTierByCode(tierCode: string): Promise<AgentTier | null>;
  getAgentTierById(id: string): Promise<AgentTier | null>;
  updateAgentTier(id: string, tierData: InsertAgentTier): Promise<AgentTier>;
  updateAgentTierStatus(id: string, status: string): Promise<AgentTier>;
  deleteAgentTier(id: string): Promise<void>;

  // Agent Tier Assignment operations
  getAgentTierAssignments(filters?: any): Promise<AgentTierAssignment[]>;
  insertAgentTierAssignment(assignmentData: InsertAgentTierAssignment): Promise<AgentTierAssignment>;
  getCurrentAgentTierAssignment(agentId: string): Promise<AgentTierAssignment | null>;
  supersedePreviousAssignments(agentId: string, newEffectiveFrom: string): Promise<void>;
  updateAgentTierAssignment(id: string, assignmentData: Partial<InsertAgentTierAssignment>): Promise<AgentTierAssignment>;
  deleteAgentTierAssignment(id: string): Promise<void>;

  // Tier Assignment Engine operations
  getTierAssignmentEngines(filters?: any): Promise<TierAssignmentEngine[]>;
  insertTierAssignmentEngine(engineData: InsertTierAssignmentEngine): Promise<TierAssignmentEngine>;
  getTierAssignmentEngineById(id: string): Promise<TierAssignmentEngine | null>;
  updateTierAssignmentEngine(id: string, engineData: Partial<InsertTierAssignmentEngine>): Promise<TierAssignmentEngine>;
  updateEngineRunTimestamps(id: string, lastRunAt: Date, nextRunAt: Date): Promise<void>;
  deleteTierAssignmentEngine(id: string): Promise<void>;

  // Campaign Management operations
  getCampaigns(filters?: any): Promise<Campaign[]>;
  insertCampaign(campaignData: InsertCampaign): Promise<Campaign>;
  getCampaignById(id: string): Promise<Campaign | null>;
  getCampaignByCode(campaignCode: string): Promise<Campaign | null>;
  updateCampaign(id: string, campaignData: Partial<InsertCampaign>): Promise<Campaign>;
  updateCampaignStatus(id: string, status: string): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  checkCampaignConflicts(campaignData: InsertCampaign): Promise<any[]>;

  // Campaign Metrics operations
  getCampaignMetrics(campaignCode: string, filters?: any): Promise<CampaignMetrics[]>;
  insertCampaignMetrics(metricsData: InsertCampaignMetrics): Promise<CampaignMetrics>;
  updateCampaignMetrics(campaignCode: string, date: string, metricsData: Partial<InsertCampaignMetrics>): Promise<CampaignMetrics>;

  // Campaign Delivery operations
  getCampaignDeliveries(campaignCode: string, filters?: any): Promise<CampaignDelivery[]>;
  insertCampaignDelivery(deliveryData: InsertCampaignDelivery): Promise<CampaignDelivery>;
  updateDeliveryStatus(id: string, status: string, timestamp?: Date): Promise<CampaignDelivery>;
  recordDeliveryEvent(id: string, event: string, data?: any): Promise<void>;
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

  // Cohort operations
  async getCohorts(filters: any = {}): Promise<Cohort[]> {
    let query = this.db.select().from(cohorts);
    const conditions = [];

    if (filters.cohortCode) {
      conditions.push(eq(cohorts.cohortCode, filters.cohortCode));
    }
    if (filters.type) {
      conditions.push(eq(cohorts.type, filters.type));
    }
    if (filters.status) {
      conditions.push(eq(cohorts.status, filters.status));
    }
    if (filters.createdBy) {
      conditions.push(eq(cohorts.createdBy, filters.createdBy));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(cohorts.createdAt);
  }

  async insertCohort(cohortData: InsertCohort): Promise<Cohort> {
    const [cohort] = await this.db.insert(cohorts).values(cohortData).returning();
    return cohort;
  }

  async getCohortById(id: string): Promise<Cohort | null> {
    const [cohort] = await this.db.select().from(cohorts).where(eq(cohorts.id, id));
    return cohort || null;
  }

  async getCohortByCode(cohortCode: string): Promise<Cohort | null> {
    const [cohort] = await this.db.select().from(cohorts).where(eq(cohorts.cohortCode, cohortCode));
    return cohort || null;
  }

  async updateCohort(id: string, cohortData: InsertCohort): Promise<Cohort> {
    const [cohort] = await this.db
      .update(cohorts)
      .set({ ...cohortData, updatedAt: new Date() })
      .where(eq(cohorts.id, id))
      .returning();
    return cohort;
  }

  async updateCohortStatus(id: string, status: string): Promise<Cohort> {
    const [cohort] = await this.db
      .update(cohorts)
      .set({ status, updatedAt: new Date() })
      .where(eq(cohorts.id, id))
      .returning();
    return cohort;
  }

  async deleteCohort(id: string): Promise<void> {
    await this.db.delete(cohorts).where(eq(cohorts.id, id));
  }

  async checkCohortConflicts(cohortData: InsertCohort): Promise<any[]> {
    // Check for existing cohort with same cohortCode
    const existingCohort = await this.getCohortByCode(cohortData.cohortCode);
    const conflicts = [];

    if (existingCohort) {
      conflicts.push({
        type: 'DUPLICATE_COHORT_CODE',
        message: `Cohort with code ${cohortData.cohortCode} already exists`,
        conflictingCohort: existingCohort
      });
    }

    return conflicts;
  }

  // Audit Log Methods
  async getAuditLogs(filters: any = {}): Promise<InsertAuditLog[]> {
    let query = this.db.select().from(auditLogs);
    const conditions: any[] = [];

    if (filters.module) {
      conditions.push(eq(auditLogs.module, filters.module));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogs.entityId, filters.entityId));
    }
    if (filters.user) {
      conditions.push(eq(auditLogs.user, filters.user));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(filters.startDate)));
    }
    if (filters.endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(auditLogs.timestamp));
  }

  async getAuditLogById(id: string): Promise<InsertAuditLog | null> {
    const result = await this.db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return result[0] || null;
  }

  async getAuditLogsByEntity(entityId: string, module?: string): Promise<InsertAuditLog[]> {
    const conditions: any[] = [eq(auditLogs.entityId, entityId)];

    if (module) {
      conditions.push(eq(auditLogs.module, module));
    }

    const query = this.db.select().from(auditLogs).where(and(...conditions));

    return await query.orderBy(desc(auditLogs.timestamp));
  }

  async insertAuditLog(data: InsertAuditLog): Promise<InsertAuditLog> {
    const result = await this.db.insert(auditLogs).values(data).returning();
    return result[0];
  }

  async deleteAuditLog(id: string): Promise<void> {
    await this.db.delete(auditLogs).where(eq(auditLogs.id, id));
  }

  // Helper method to create audit logs
  async createAuditLog(params: {
    user: string;
    module: string;
    entityId: string;
    action: string;
    beforeData?: any;
    afterData?: any;
    justification?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<InsertAuditLog> {
    const auditData: InsertAuditLog = {
      timestamp: new Date(),
      user: params.user,
      module: params.module,
      entityId: params.entityId,
      action: params.action,
      beforeData: params.beforeData || null,
      afterData: params.afterData || null,
      justification: params.justification || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      sessionId: params.sessionId || null,
    };

    // Calculate diff if both before and after data exist
    if (params.beforeData && params.afterData) {
      auditData.diff = this.calculateDiff(params.beforeData, params.afterData);
    }

    return await this.insertAuditLog(auditData);
  }

  // Helper method to calculate differences between two objects
  private calculateDiff(before: any, after: any): Record<string, { from: any; to: any }> {
    const diff: Record<string, { from: any; to: any }> = {};

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of allKeys) {
      const beforeValue = before?.[key];
      const afterValue = after?.[key];

      // Skip timestamps and IDs that are expected to change
      if (['createdAt', 'updatedAt', 'id'].includes(key)) {
        continue;
      }

      // Compare values (deep comparison for objects/arrays)
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        diff[key] = {
          from: beforeValue,
          to: afterValue
        };
      }
    }

    return diff;
  }

  // Wrapper method for operations that need audit logging
  async withAuditLog<T>(
    operation: () => Promise<T>,
    auditParams: {
      user: string;
      module: string;
      entityId: string;
      action: string;
      justification?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    },
    getBeforeData?: () => Promise<any>
  ): Promise<T> {
    // Get before data if getter is provided
    const beforeData = getBeforeData ? await getBeforeData() : null;

    try {
      // Execute the operation
      const result = await operation();

      // Create audit log with after data
      await this.createAuditLog({
        ...auditParams,
        beforeData,
        afterData: result,
      });

      return result;
    } catch (error) {
      // Log failed operations too
      await this.createAuditLog({
        ...auditParams,
        action: `${auditParams.action}_FAILED`,
        beforeData,
        afterData: { error: error.message },
      });

      throw error;
    }
  }

  // Agent Tier Management operations
  async getAgentTiers(filters: any = {}): Promise<AgentTier[]> {
    let query = this.db.select().from(agentTiers);
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(agentTiers.status, filters.status));
    }
    if (filters.kpiWindow) {
      conditions.push(eq(agentTiers.kpiWindow, filters.kpiWindow));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(
      sql`CASE ${agentTiers.tierCode} 
          WHEN 'PLATINUM' THEN 1 
          WHEN 'GOLD' THEN 2 
          WHEN 'SILVER' THEN 3 
          WHEN 'BRONZE' THEN 4 
          ELSE 5 END`
    );
  }

  async insertAgentTier(tierData: InsertAgentTier): Promise<AgentTier> {
    const [tier] = await this.db.insert(agentTiers).values(tierData).returning();
    return tier;
  }

  async getAgentTierByCode(tierCode: string): Promise<AgentTier | null> {
    const [tier] = await this.db.select().from(agentTiers).where(eq(agentTiers.tierCode, tierCode));
    return tier || null;
  }

  async getAgentTierById(id: string): Promise<AgentTier | null> {
    const [tier] = await this.db.select().from(agentTiers).where(eq(agentTiers.id, id));
    return tier || null;
  }

  async updateAgentTier(id: string, tierData: InsertAgentTier): Promise<AgentTier> {
    const [tier] = await this.db
      .update(agentTiers)
      .set({ ...tierData, updatedAt: new Date() })
      .where(eq(agentTiers.id, id))
      .returning();
    return tier;
  }

  async updateAgentTierStatus(id: string, status: string): Promise<AgentTier> {
    const [tier] = await this.db
      .update(agentTiers)
      .set({ status, updatedAt: new Date() })
      .where(eq(agentTiers.id, id))
      .returning();
    return tier;
  }

  async deleteAgentTier(id: string): Promise<void> {
    await this.db.delete(agentTiers).where(eq(agentTiers.id, id));
  }

  // Agent Tier Assignment operations
  async getAgentTierAssignments(filters: any = {}): Promise<AgentTierAssignment[]> {
    let query = this.db.select().from(agentTierAssignments);
    const conditions = [];

    if (filters.agentId) {
      conditions.push(eq(agentTierAssignments.agentId, filters.agentId));
    }
    if (filters.tierCode) {
      conditions.push(eq(agentTierAssignments.tierCode, filters.tierCode));
    }
    if (filters.status) {
      conditions.push(eq(agentTierAssignments.status, filters.status));
    }
    if (filters.assignmentType) {
      conditions.push(eq(agentTierAssignments.assignmentType, filters.assignmentType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(agentTierAssignments.effectiveFrom));
  }

  async insertAgentTierAssignment(assignmentData: InsertAgentTierAssignment): Promise<AgentTierAssignment> {
    const [assignment] = await this.db.insert(agentTierAssignments).values(assignmentData).returning();
    return assignment;
  }

  async getCurrentAgentTierAssignment(agentId: string): Promise<AgentTierAssignment | null> {
    const [assignment] = await this.db
      .select()
      .from(agentTierAssignments)
      .where(
        and(
          eq(agentTierAssignments.agentId, agentId),
          eq(agentTierAssignments.status, "ACTIVE"),
          sql`${agentTierAssignments.effectiveFrom} <= CURRENT_DATE`,
          sql`(${agentTierAssignments.effectiveTo} IS NULL OR ${agentTierAssignments.effectiveTo} > CURRENT_DATE)`
        )
      )
      .orderBy(desc(agentTierAssignments.effectiveFrom))
      .limit(1);
    return assignment || null;
  }

  async supersedePreviousAssignments(agentId: string, newEffectiveFrom: string): Promise<void> {
    await this.db
      .update(agentTierAssignments)
      .set({ 
        status: "SUPERSEDED", 
        effectiveTo: newEffectiveFrom,
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(agentTierAssignments.agentId, agentId),
          eq(agentTierAssignments.status, "ACTIVE")
        )
      );
  }

  async updateAgentTierAssignment(id: string, assignmentData: Partial<InsertAgentTierAssignment>): Promise<AgentTierAssignment> {
    const [assignment] = await this.db
      .update(agentTierAssignments)
      .set({ ...assignmentData, updatedAt: new Date() })
      .where(eq(agentTierAssignments.id, id))
      .returning();
    return assignment;
  }

  async deleteAgentTierAssignment(id: string): Promise<void> {
    await this.db.delete(agentTierAssignments).where(eq(agentTierAssignments.id, id));
  }

  // Tier Assignment Engine operations
  async getTierAssignmentEngines(filters: any = {}): Promise<TierAssignmentEngine[]> {
    let query = this.db.select().from(tierAssignmentEngine);
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(tierAssignmentEngine.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(tierAssignmentEngine.createdAt));
  }

  async insertTierAssignmentEngine(engineData: InsertTierAssignmentEngine): Promise<TierAssignmentEngine> {
    const [engine] = await this.db.insert(tierAssignmentEngine).values(engineData).returning();
    return engine;
  }

  async getTierAssignmentEngineById(id: string): Promise<TierAssignmentEngine | null> {
    const [engine] = await this.db.select().from(tierAssignmentEngine).where(eq(tierAssignmentEngine.id, id));
    return engine || null;
  }

  async updateTierAssignmentEngine(id: string, engineData: Partial<InsertTierAssignmentEngine>): Promise<TierAssignmentEngine> {
    const [engine] = await this.db
      .update(tierAssignmentEngine)
      .set({ ...engineData, updatedAt: new Date() })
      .where(eq(tierAssignmentEngine.id, id))
      .returning();
    return engine;
  }

  async updateEngineRunTimestamps(id: string, lastRunAt: Date, nextRunAt: Date): Promise<void> {
    await this.db
      .update(tierAssignmentEngine)
      .set({ lastRunAt, nextRunAt, updatedAt: new Date() })
      .where(eq(tierAssignmentEngine.id, id));
  }

  async deleteTierAssignmentEngine(id: string): Promise<void> {
    await this.db.delete(tierAssignmentEngine).where(eq(tierAssignmentEngine.id, id));
  }

  // KPI calculation and tier evaluation helpers
  async calculateAgentKPIs(agentId: string, window: 'MONTHLY' | 'QUARTERLY'): Promise<any> {
    // Mock KPI calculation - in real implementation, this would aggregate from booking data
    const mockKPIs = {
      totalBookingValue: Math.floor(Math.random() * 100000000), // 0-100M
      totalBookings: Math.floor(Math.random() * 2000), // 0-2000
      avgBookingsPerMonth: Math.floor(Math.random() * 500), // 0-500
      avgSearchesPerMonth: Math.floor(Math.random() * 6000), // 0-6000
      conversionPct: Math.round((Math.random() * 15) * 100) / 100, // 0-15%
    };
    return mockKPIs;
  }

  async evaluateAgentTier(agentId: string, kpiData: any): Promise<string> {
    const tiers = await this.getAgentTiers({ status: 'ACTIVE' });

    // Sort tiers by requirements (highest to lowest)
    const sortedTiers = tiers.sort((a, b) => {
      const aThreshold = (a.kpiThresholds as any).totalBookingValueMin;
      const bThreshold = (b.kpiThresholds as any).totalBookingValueMin;
      return bThreshold - aThreshold;
    });

    // Find the highest tier the agent qualifies for
    for (const tier of sortedTiers) {
      const thresholds = tier.kpiThresholds as any;

      if (kpiData.totalBookingValue >= thresholds.totalBookingValueMin &&
          kpiData.totalBookings >= thresholds.totalBookingsMin &&
          kpiData.avgBookingsPerMonth >= thresholds.avgBookingsPerMonthMin &&
          kpiData.avgSearchesPerMonth >= thresholds.avgSearchesPerMonthMin &&
          kpiData.conversionPct >= thresholds.conversionPctMin) {
        return tier.tierCode;
      }
    }

    // Default to BRONZE if no tier qualifies
    return 'BRONZE';
  }

  async checkTierConflicts(tierData: InsertAgentTier): Promise<any[]> {
    const conflicts = [];

    // Check for duplicate tier code
    const existingTier = await this.getAgentTierByCode(tierData.tierCode);
    if (existingTier) {
      conflicts.push({
        type: 'DUPLICATE_TIER_CODE',
        message: `Tier with code ${tierData.tierCode} already exists`,
        conflictingTier: existingTier
      });
    }

    return conflicts;
  }

  // Campaign Management operations
  async getCampaigns(filters: any = {}): Promise<Campaign[]> {
    let query = this.db.select().from(campaigns);
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(campaigns.status, filters.status));
    }
    if (filters.campaignCode) {
      conditions.push(ilike(campaigns.campaignCode, `%${filters.campaignCode}%`));
    }
    if (filters.createdBy) {
      conditions.push(eq(campaigns.createdBy, filters.createdBy));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(campaigns.createdAt));
  }

  async insertCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await this.db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const [campaign] = await this.db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || null;
  }

  async getCampaignByCode(campaignCode: string): Promise<Campaign | null> {
    const [campaign] = await this.db.select().from(campaigns).where(eq(campaigns.campaignCode, campaignCode));
    return campaign || null;
  }

  async updateCampaign(id: string, campaignData: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await this.db
      .update(campaigns)
      .set({ ...campaignData, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async updateCampaignStatus(id: string, status: string): Promise<Campaign> {
    const [campaign] = await this.db
      .update(campaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async checkCampaignConflicts(campaignData: InsertCampaign): Promise<any[]> {
    const conflicts = [];

    // Check for duplicate campaign code
    const existingCampaign = await this.getCampaignByCode(campaignData.campaignCode);
    if (existingCampaign) {
      conflicts.push({
        type: 'DUPLICATE_CAMPAIGN_CODE',
        message: `Campaign with code ${campaignData.campaignCode} already exists`,
        conflictingCampaign: existingCampaign
      });
    }

    return conflicts;
  }

  // Campaign Metrics operations
  async getCampaignMetrics(campaignCode: string, filters: any = {}): Promise<CampaignMetrics[]> {
    let query = this.db.select().from(campaignMetrics).where(eq(campaignMetrics.campaignCode, campaignCode));

    const conditions = [];
    if (filters.startDate) {
      conditions.push(gte(campaignMetrics.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(campaignMetrics.date, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(eq(campaignMetrics.campaignCode, campaignCode), ...conditions));
    }

    return await query.orderBy(desc(campaignMetrics.date));
  }

  async insertCampaignMetrics(metricsData: InsertCampaignMetrics): Promise<CampaignMetrics> {
    const [metrics] = await this.db.insert(campaignMetrics).values(metricsData).returning();
    return metrics;
  }

  async updateCampaignMetrics(campaignCode: string, date: string, metricsData: Partial<InsertCampaignMetrics>): Promise<CampaignMetrics> {
    const [metrics] = await this.db
      .update(campaignMetrics)
      .set(metricsData)
      .where(and(eq(campaignMetrics.campaignCode, campaignCode), eq(campaignMetrics.date, date)))
      .returning();
    return metrics;
  }

  // Campaign Delivery operations
  async getCampaignDeliveries(campaignCode: string, filters: any = {}): Promise<CampaignDelivery[]> {
    let query = this.db.select().from(campaignDeliveries).where(eq(campaignDeliveries.campaignCode, campaignCode));

    const conditions = [];
    if (filters.agentId) {
      conditions.push(eq(campaignDeliveries.agentId, filters.agentId));
    }
    if (filters.deliveryStatus) {
      conditions.push(eq(campaignDeliveries.deliveryStatus, filters.deliveryStatus));
    }
    if (filters.deliveryChannel) {
      conditions.push(eq(campaignDeliveries.deliveryChannel, filters.deliveryChannel));
    }

    if (conditions.length > 0) {
      query = query.where(and(eq(campaignDeliveries.campaignCode, campaignCode), ...conditions));
    }

    return await query.orderBy(desc(campaignDeliveries.createdAt));
  }

  async insertCampaignDelivery(deliveryData: InsertCampaignDelivery): Promise<CampaignDelivery> {
    const [delivery] = await this.db.insert(campaignDeliveries).values(deliveryData).returning();
    return delivery;
  }

  async updateDeliveryStatus(id: string, status: string, timestamp?: Date): Promise<CampaignDelivery> {
    const updateData: any = { deliveryStatus: status };

    switch (status) {
      case 'SENT':
        updateData.sentAt = timestamp || new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = timestamp || new Date();
        break;
    }

    const [delivery] = await this.db
      .update(campaignDeliveries)
      .set(updateData)
      .where(eq(campaignDeliveries.id, id))
      .returning();
    return delivery;
  }

  async recordDeliveryEvent(id: string, event: string, data?: any): Promise<void> {
    const updateData: any = {};
    const timestamp = new Date();

    switch (event) {
      case 'OPENED':
        updateData.openedAt = timestamp;
        break;
      case 'CLICKED':
        updateData.clickedAt = timestamp;
        break;
      case 'PURCHASED':
        updateData.purchasedAt = timestamp;
        if (data?.amount) {
          updateData.purchaseAmount = data.amount;
        }
        break;
    }

    await this.db
      .update(campaignDeliveries)
      .set(updateData)
      .where(eq(campaignDeliveries.id, id));
  }
}

export const storage = new DatabaseStorage();