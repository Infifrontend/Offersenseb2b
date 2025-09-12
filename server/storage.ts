import { users, negotiatedFares, dynamicDiscountRules, airAncillaryRules, nonAirRates, nonAirMarkupRules, bundles, bundlePricingRules, offerRules, offerTraces, agents, channelPricingOverrides, cohorts, auditLogs, agentTiers, agentTierAssignments, tierAssignmentEngine, campaigns, campaignMetrics, campaignDeliveries, simulations, insightQueries } from "../shared/schema";
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
  Simulation,
  InsightQuery,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, like, inArray, or, ilike } from "drizzle-orm";
import * as crypto from 'crypto';


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
  insertBundlePricingRule(rule: InsertBundlePricingRule): Promise<BundlePricingRule>;
  getBundlePricingRules(filters?: any): Promise<BundlePricingRule[]>;
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
  calculateAgentKPIs(agentId: string, window: string): Promise<any>;
  evaluateAgentTier(agentId: string, kpiData: any): Promise<string>;

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
  recordDeliveryEvent(deliveryId: string, event: string, data?: any): Promise<void>;

  // Simulation methods
  getSimulations(filters?: any): Promise<Simulation[]>;
  getSimulationById(id: string): Promise<Simulation | null>;
  insertSimulation(data: Partial<Simulation>): Promise<Simulation>;
  updateSimulation(id: string, data: Partial<Simulation>): Promise<Simulation>;
  updateSimulationStatus(id: string, status: string): Promise<Simulation>;
  deleteSimulation(id: string): Promise<void>;
  runSimulation(id: string): Promise<Simulation>;

  // Insight Query methods
  getInsightQueries(filters?: any): Promise<InsightQuery[]>;
  getInsightQueryById(id: string): Promise<InsightQuery | null>;
  insertInsightQuery(data: Partial<InsightQuery>): Promise<InsightQuery>;
  processInsightQuery(id: string): Promise<InsightQuery>;
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

  async insertDynamicDiscountRule(data: any): Promise<InsertDynamicDiscountRule> {
    try {
      console.log("Inserting rule into database:", data);

      // Ensure required fields are present and properly formatted
      const ruleData = {
        ...data,
        adjustmentValue: data.adjustmentValue.toString(),
        stackable: data.stackable || "false",
        priority: data.priority || 1,
        status: data.status || "ACTIVE"
      };

      const [rule] = await this.db.insert(dynamicDiscountRules).values(ruleData).returning();
      console.log("Successfully inserted rule:", rule);

      return rule;
    } catch (error: any) {
      console.error("Database error inserting rule:", error);
      throw error;
    }
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
  async insertBundlePricingRule(rule: InsertBundlePricingRule): Promise<BundlePricingRule> {
    const [newRule] = await this.db.insert(bundlePricingRules).values(rule).returning();
    return newRule;
  }

  async getBundlePricingRules(filters: Record<string, any> = {}): Promise<InsertBundlePricingRule[]> {
    console.log("Storage: getBundlePricingRules called with filters:", filters);

    try {
      let query = this.db.select().from(bundlePricingRules);

      // Apply filters
      const conditions = [];
      if (filters.bundleCode) {
        conditions.push(eq(bundlePricingRules.bundleCode, filters.bundleCode));
      }
      if (filters.status) {
        conditions.push(eq(bundlePricingRules.status, filters.status));
      }
      if (filters.ruleCode) {
        conditions.push(eq(bundlePricingRules.ruleCode, filters.ruleCode));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      console.log("Storage: Executing query for bundle pricing rules");
      const results = await query.orderBy(bundlePricingRules.priority, bundlePricingRules.createdAt);
      console.log(`Storage: Found ${results?.length || 0} bundle pricing rules`);

      // Ensure we always return an array
      const rulesArray = Array.isArray(results) ? results : [];

      // Log a sample record if any exist
      if (rulesArray.length > 0) {
        console.log("Storage: Sample pricing rule:", JSON.stringify(rulesArray[0], null, 2));
      } else {
        console.log("Storage: No bundle pricing rules found in database");
      }

      return rulesArray;
    } catch (error: any) {
      console.error("Storage: Database error in getBundlePricingRules:", error.message);

      // Return empty array instead of throwing to prevent complete failure
      console.error("Storage: Returning empty array due to database error");
      return [];
    }
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
    try {
      console.log("Storage: Inserting offer rule:", rule);

      // Ensure required fields have default values
      const ruleData = {
        ...rule,
        status: rule.status || "DRAFT",
        priority: rule.priority || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log("Storage: Rule data to insert:", ruleData);

      const result = await this.db.insert(offerRules).values(ruleData).returning();
      console.log("Storage: Successfully inserted offer rule:", result[0]);

      if (!result || result.length === 0) {
        throw new Error("Failed to insert offer rule - no result returned");
      }

      return result[0];
    } catch (error: any) {
      console.error("Storage: Error inserting offer rule:", error);
      console.error("Storage: Error details:", error.message);
      console.error("Storage: Error stack:", error.stack);
      throw new Error(`Failed to insert offer rule: ${error.message}`);
    }
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
        let hasOverlap = false;

        // Check POS overlap
        if (existingConditions.pos && newConditions.pos) {
          const posOverlap = existingConditions.pos.some((pos: string) => 
            newConditions.pos.includes(pos)
          );
          if (posOverlap) hasOverlap = true;
        }

        // Check agent tier overlap
        if (existingConditions.agentTier && newConditions.agentTier) {
          const tierOverlap = existingConditions.agentTier.some((tier: string) => 
            newConditions.agentTier.includes(tier)
          );
          if (tierOverlap) hasOverlap = true;
        }

        // Check channel overlap
        if (existingConditions.channel && newConditions.channel) {
          const channelOverlap = existingConditions.channel.some((channel: string) => 
            newConditions.channel.includes(channel)
          );
          if (channelOverlap) hasOverlap = true;
        }

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
    try {
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

      const results = await query.orderBy(cohorts.createdAt);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error("Error in getCohorts:", error);
      return [];
    }
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
    try {
      console.log("Storage: getAgentTierAssignments called with filters:", filters);

      // Check if database connection is working
      const connectionTest = await this.db.select().from(agentTiers).limit(1);
      console.log("Storage: Database connection test passed");

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

      console.log("Storage: Executing tier assignments query...");
      const results = await query.orderBy(desc(agentTierAssignments.effectiveFrom));
      console.log(`Storage: Successfully found ${results?.length || 0} tier assignments`);

      // Ensure we always return an array
      const assignments = Array.isArray(results) ? results : [];
      console.log("Storage: Returning assignments array:", assignments.length);
      return assignments;
    } catch (error: any) {
      console.error("Storage: Error in getAgentTierAssignments:", error);
      console.error("Storage: Error stack:", error.stack);
      // Return empty array instead of throwing to prevent complete failure
      return [];
    }
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
    try {
      console.log("Storage: getTierAssignmentEngines called with filters:", filters);

      let query = this.db.select().from(tierAssignmentEngine);
      const conditions = [];

      if (filters.status) {
        conditions.push(eq(tierAssignmentEngine.status, filters.status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query.orderBy(desc(tierAssignmentEngine.createdAt));
      console.log(`Storage: Found ${results?.length || 0} tier assignment engines`);

      return Array.isArray(results) ? results : [];
    } catch (error: any) {
      console.error("Storage: Error in getTierAssignmentEngines:", error);
      return [];
    }
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

  // Agent Tier Assignment operations
  async getAgentTierAssignments(filters: any = {}): Promise<AgentTierAssignment[]> {
    console.log("Storage: getAgentTierAssignments called with filters:", filters);
    
    try {
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
      
      const result = await query.orderBy(desc(agentTierAssignments.createdAt));
      console.log(`Storage: Found ${result.length} tier assignments`);
      return result;
    } catch (error) {
      console.error("Storage: Error in getAgentTierAssignments:", error);
      throw error;
    }
  }

  async insertAgentTierAssignment(assignmentData: InsertAgentTierAssignment): Promise<AgentTierAssignment> {
    console.log("Storage: insertAgentTierAssignment called with:", assignmentData);
    
    try {
      const [result] = await this.db.insert(agentTierAssignments).values(assignmentData).returning();
      console.log("Storage: Created tier assignment:", result);
      return result;
    } catch (error) {
      console.error("Storage: Error creating tier assignment:", error);
      throw error;
    }
  }

  async getCurrentAgentTierAssignment(agentId: string): Promise<AgentTierAssignment | null> {
    console.log("Storage: getCurrentAgentTierAssignment called for agent:", agentId);
    
    try {
      const [result] = await this.db
        .select()
        .from(agentTierAssignments)
        .where(
          and(
            eq(agentTierAssignments.agentId, agentId),
            eq(agentTierAssignments.status, "ACTIVE")
          )
        )
        .orderBy(desc(agentTierAssignments.effectiveFrom))
        .limit(1);
      
      console.log("Storage: Current assignment:", result || "None found");
      return result || null;
    } catch (error) {
      console.error("Storage: Error getting current assignment:", error);
      throw error;
    }
  }

  async supersedePreviousAssignments(agentId: string, newEffectiveFrom: string): Promise<void> {
    console.log("Storage: supersedePreviousAssignments called for agent:", agentId);
    
    try {
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
      
      console.log("Storage: Superseded previous assignments");
    } catch (error) {
      console.error("Storage: Error superseding assignments:", error);
      throw error;
    }
  }

  async updateAgentTierAssignment(id: string, assignmentData: Partial<InsertAgentTierAssignment>): Promise<AgentTierAssignment> {
    console.log("Storage: updateAgentTierAssignment called:", id, assignmentData);
    
    try {
      const [result] = await this.db
        .update(agentTierAssignments)
        .set({ ...assignmentData, updatedAt: new Date() })
        .where(eq(agentTierAssignments.id, id))
        .returning();
      
      if (!result) {
        throw new Error("Tier assignment not found");
      }
      
      console.log("Storage: Updated tier assignment:", result);
      return result;
    } catch (error) {
      console.error("Storage: Error updating tier assignment:", error);
      throw error;
    }
  }

  async deleteAgentTierAssignment(id: string): Promise<void> {
    console.log("Storage: deleteAgentTierAssignment called:", id);
    
    try {
      await this.db.delete(agentTierAssignments).where(eq(agentTierAssignments.id, id));
      console.log("Storage: Deleted tier assignment");
    } catch (error) {
      console.error("Storage: Error deleting tier assignment:", error);
      throw error;
    }
  }

  async calculateAgentKPIs(agentId: string, window: string): Promise<any> {
    console.log("Storage: calculateAgentKPIs called for agent:", agentId, "window:", window);
    
    // Mock KPI calculation - in real implementation this would aggregate booking data
    const mockKPIs = {
      totalBookingValue: Math.floor(Math.random() * 100000000) + 10000000,
      totalBookings: Math.floor(Math.random() * 3000) + 500,
      avgBookingsPerMonth: Math.floor(Math.random() * 800) + 100,
      avgSearchesPerMonth: Math.floor(Math.random() * 10000) + 1000,
      conversionPct: Math.round((Math.random() * 5 + 5) * 100) / 100 // 5-10%
    };
    
    console.log("Storage: Calculated KPIs:", mockKPIs);
    return mockKPIs;
  }

  async evaluateAgentTier(agentId: string, kpiData: any): Promise<string> {
    console.log("Storage: evaluateAgentTier called for agent:", agentId, "with KPIs:", kpiData);
    
    try {
      // Get all active tiers
      const tiers = await this.getAgentTiers({ status: "ACTIVE" });
      
      // Sort tiers by threshold requirements (descending order)
      const sortedTiers = tiers.sort((a, b) => {
        const aThresholds = a.kpiThresholds as any;
        const bThresholds = b.kpiThresholds as any;
        return (bThresholds.totalBookingValueMin || 0) - (aThresholds.totalBookingValueMin || 0);
      });
      
      // Evaluate against each tier
      for (const tier of sortedTiers) {
        const thresholds = tier.kpiThresholds as any;
        
        const meetsRequirements = 
          (kpiData.totalBookingValue >= (thresholds.totalBookingValueMin || 0)) &&
          (kpiData.totalBookings >= (thresholds.totalBookingsMin || 0)) &&
          (kpiData.avgBookingsPerMonth >= (thresholds.avgBookingsPerMonthMin || 0)) &&
          (kpiData.avgSearchesPerMonth >= (thresholds.avgSearchesPerMonthMin || 0)) &&
          (kpiData.conversionPct >= (thresholds.conversionPctMin || 0));
        
        if (meetsRequirements) {
          console.log("Storage: Agent qualifies for tier:", tier.tierCode);
          return tier.tierCode;
        }
      }
      
      // Default to BRONZE if no tier matches
      console.log("Storage: Agent defaults to BRONZE tier");
      return "BRONZE";
    } catch (error) {
      console.error("Storage: Error evaluating tier:", error);
      return "BRONZE"; // Safe default
    }
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

  async recordDeliveryEvent(deliveryId: string, event: string, data?: any) {
    await this.db.update(campaignDeliveries)
      .set({
        [`${event.toLowerCase()}At`]: new Date(),
        ...(event === "PURCHASED" && data?.amount && { purchaseAmount: data.amount.toString() })
      })
      .where(eq(campaignDeliveries.id, deliveryId));
  }

  // Simulation methods
  async getSimulations(filters: any = {}): Promise<Simulation[]> {
    let query = this.db.select().from(simulations);

    if (filters.status) {
      query = query.where(eq(simulations.status, filters.status));
    }

    if (filters.createdBy) {
      query = query.where(eq(simulations.createdBy, filters.createdBy));
    }

    return query.orderBy(desc(simulations.createdAt));
  }

  async getSimulationById(id: string): Promise<Simulation | null> {
    const result = await this.db.select().from(simulations).where(eq(simulations.id, id));
    return result[0] || null;
  }

  async insertSimulation(data: Partial<Simulation>): Promise<Simulation> {
    const result = await this.db.insert(simulations).values(data).returning();
    return result[0];
  }

  async updateSimulation(id: string, data: Partial<Simulation>): Promise<Simulation> {
    const result = await this.db.update(simulations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(simulations.id, id))
      .returning();
    return result[0];
  }

  async updateSimulationStatus(id: string, status: string): Promise<Simulation> {
    const result = await this.db.update(simulations)
      .set({ status, updatedAt: new Date() })
      .where(eq(simulations.id, id))
      .returning();
    return result[0];
  }

  async deleteSimulation(id: string): Promise<void> {
    await this.db.delete(simulations).where(eq(simulations.id, id));
  }

  async runSimulation(id: string): Promise<Simulation> {
    // Mock simulation engine - in real implementation would integrate with actual analytics
    const simulation = await this.getSimulationById(id);
    if (!simulation) throw new Error("Simulation not found");

    // Update status to running
    await this.updateSimulationStatus(id, "RUNNING");

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock results based on the forecast with some variance
    const forecast = simulation.forecast as any;
    const actualResults = {
      revenueChangePct: this.addVariance(forecast.revenueChangePct),
      conversionChangePct: this.addVariance(forecast.conversionChangePct),
      marginImpactPct: this.addVariance(forecast.marginImpactPct),
      attachRateChangePct: forecast.attachRateChangePct ? this.addVariance(forecast.attachRateChangePct) : undefined,
    };

    // Update with results
    return this.updateSimulation(id, {
      status: "COMPLETED",
      actualResults
    });
  }

  private addVariance(value: string): string {
    const numValue = parseFloat(value.replace(/[+%]/g, ''));
    const variance = (Math.random() - 0.5) * 0.4; // ±20% variance
    const result = numValue + variance;
    return (result >= 0 ? '+' : '') + result.toFixed(1);
  }

  // Insight Query methods
  async getInsightQueries(filters: any = {}): Promise<InsightQuery[]> {
    let query = this.db.select().from(insightQueries);

    if (filters.status) {
      query = query.where(eq(insightQueries.status, filters.status));
    }

    if (filters.createdBy) {
      query = query.where(eq(insightQueries.createdBy, filters.createdBy));
    }

    return query.orderBy(desc(insightQueries.createdAt));
  }

  async getInsightQueryById(id: string): Promise<InsightQuery | null> {
    const result = await this.db.select().from(insightQueries).where(eq(insightQueries.id, id));
    return result[0] || null;
  }

  async insertInsightQuery(data: Partial<InsightQuery>): Promise<InsightQuery> {
    const result = await this.db.insert(insightQueries).values(data).returning();
    return result[0];
  }

  async processInsightQuery(id: string): Promise<InsightQuery> {
    const query = await this.getInsightQueryById(id);
    if (!query) throw new Error("Query not found");

    // Update status to processing
    await this.db.update(insightQueries)
      .set({ status: "PROCESSING" })
      .where(eq(insightQueries.id, id));

    const startTime = Date.now();

    try {
      // Mock NLP processing - in real implementation would integrate with NLP service
      const response = await this.mockNLPProcessor(query.queryText, query.filters);
      const executionTime = Date.now() - startTime;

      // Update with results
      await this.db.update(insightQueries)
        .set({
          status: "COMPLETED",
          response,
          executionTimeMs: executionTime
        })
        .where(eq(insightQueries.id, id));

      return { ...query, response, executionTimeMs: executionTime, status: "COMPLETED" };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.db.update(insightQueries)
        .set({
          status: "ERROR",
          response: { answer: "Error processing query", error: error instanceof Error ? error.message : "Unknown error" },
          executionTimeMs: executionTime
        })
        .where(eq(insightQueries.id, id));

      throw error;
    }
  }

  private async mockNLPProcessor(queryText: string, filters: any): Promise<any> {
    // Mock NLP processing with predefined responses
    const lowercaseQuery = queryText.toLowerCase();

    if (lowercaseQuery.includes("revenue") || lowercaseQuery.includes("sales")) {
      return {
        answer: "Based on historical data, revenue has increased by 12.3% over the past quarter, with the highest growth in the GCC region (+18.2%) and among Gold tier agents (+15.7%). Portal channel contributed 67% of total revenue.",
        data: {
          totalRevenue: "$2.4M",
          growth: "+12.3%",
          topRegion: "GCC (+18.2%)",
          topTier: "Gold (+15.7%)",
          channelBreakdown: { portal: "67%", api: "28%", mobile: "5%" }
        },
        confidence: 0.89,
        sources: ["negotiated_fares", "offer_traces", "campaign_metrics"]
      };
    }

    if (lowercaseQuery.includes("conversion") || lowercaseQuery.includes("attach")) {
      return {
        answer: "Current conversion rate is 4.2% across all channels, with ancillary attachment rate at 34%. Platinum tier agents achieve 6.8% conversion, while Bronze tier averages 2.1%. Mobile channel shows the lowest conversion at 1.9%.",
        data: {
          overallConversion: "4.2%",
          ancillaryAttachment: "34%",
          tierPerformance: { platinum: "6.8%", gold: "4.9%", silver: "3.2%", bronze: "2.1%" },
          channelPerformance: { portal: "5.1%", api: "4.8%", mobile: "1.9%" }
        },
        confidence: 0.92,
        sources: ["offer_traces", "agent_tier_assignments", "campaign_deliveries"]
      };
    }

    if (lowercaseQuery.includes("discount") || lowercaseQuery.includes("pricing")) {
      return {
        answer: "Average discount applied is 8.5% across all bookings. Dynamic discount rules are triggered in 42% of searches, with highest usage in competitive routes like DXB-LHR (65% trigger rate). Margin impact averages -2.1%.",
        data: {
          avgDiscount: "8.5%",
          rulesTriggerRate: "42%",
          topRoute: "DXB-LHR (65%)",
          marginImpact: "-2.1%",
          discountDistribution: { "0-5%": "28%", "5-10%": "45%", "10-15%": "22%", "15%+": "5%" }
        },
        confidence: 0.86,
        sources: ["dynamic_discount_rules", "offer_traces", "negotiated_fares"]
      };
    }

    if (lowercaseQuery.includes("campaign") || lowercaseQuery.includes("marketing")) {
      return {
        answer: "Active campaigns show 2.8% average uplift in conversion. 'Pre-Travel Baggage Upsell' campaign achieved highest ROI at 4.2x with 78% delivery rate. Email channel outperforms WhatsApp by 23%.",
        data: {
          campaignUplift: "2.8%",
          topCampaign: "Pre-Travel Baggage Upsell (4.2x ROI)",
          deliveryRate: "78%",
          channelPerformance: { email: "45%", whatsapp: "22%", portal: "33%" }
        },
        confidence: 0.91,
        sources: ["campaigns", "campaign_metrics", "campaign_deliveries"]
      };
    }

    // Default response for unrecognized queries
    return {
      answer: `I found ${Math.floor(Math.random() * 1000) + 100} relevant records for your query. The analysis shows varied performance patterns across different segments. For more specific insights, try asking about revenue, conversion rates, discounts, or campaign performance.`,
      data: {
        recordsFound: Math.floor(Math.random() * 1000) + 100,
        timeRange: filters?.timeRange || "Last 30 days",
        scope: "All markets and tiers"
      },
      confidence: 0.65,
      sources: ["multiple_tables"]
    };
  }
}

export const storage = new DatabaseStorage();