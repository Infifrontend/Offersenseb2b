import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { insertNegotiatedFareSchema, insertDynamicDiscountRuleSchema, insertAirAncillaryRuleSchema, insertNonAirRateSchema, insertNonAirMarkupRuleSchema, insertBundleSchema, insertBundlePricingRuleSchema, insertOfferRuleSchema, insertOfferTraceSchema, insertAgentSchema, insertChannelPricingOverrideSchema, insertCohortSchema, insertAuditLogSchema, insertAgentTierSchema, insertAgentTierAssignmentSchema, insertTierAssignmentEngineSchema, insertCampaignSchema, insertCampaignMetricsSchema, insertCampaignDeliverySchema, insertSimulationSchema, insertInsightQuerySchema } from "../shared/schema";

// Enhanced AI template generation function
async function generateAITemplates(type: string, context: any): Promise<any[]> {
  console.log(`Generating ${type} templates with context:`, context);
  
  // Extract campaign details for template generation
  const {
    campaignName = 'Special Campaign',
    offerType = 'PERCENT',
    offerValue = 10,
    specialPrice,
    products = { ancillaries: [], bundles: [] },
    target = { agentTiers: [], cohorts: [] },
    companyName = 'OfferSense',
    brandTone = 'professional',
    urgency = 'medium'
  } = context;

  // Generate offer text
  const getOfferText = () => {
    if (offerType === 'PERCENT') return `${offerValue}% discount`;
    if (offerType === 'AMOUNT') return `$${offerValue} off`;
    if (offerType === 'SPECIAL_PRICE') return `special price of $${specialPrice}`;
    return 'exclusive offer';
  };

  // Generate product mentions
  const getProductMentions = () => {
    const allProducts = [...(products.ancillaries || []), ...(products.bundles || [])];
    if (allProducts.length === 0) return 'travel services';
    if (allProducts.length === 1) return allProducts[0];
    if (allProducts.length === 2) return `${allProducts[0]} and ${allProducts[1]}`;
    return `${allProducts[0]}, ${allProducts[1]} and more`;
  };

  if (type === 'email') {
    return [
      {
        id: `email_template_1_${Date.now()}`,
        name: "Exclusive Offer Campaign",
        subject: `🎯 Exclusive ${getOfferText()} on ${getProductMentions()} - Limited Time!`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">${campaignName}</h1>
              <p style="margin: 10px 0 0; font-size: 16px;">Exclusive offer just for you!</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Don't miss out on this amazing deal!</h2>
              
              <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                <h3 style="color: #667eea; margin: 0 0 10px;">🎉 Special Offer</h3>
                <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0;">
                  Get ${getOfferText()} on ${getProductMentions()}
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                We're excited to offer you this exclusive deal on our premium travel services. 
                This limited-time offer is specially curated for valued customers like you.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Claim Your Offer Now →
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                This offer is valid for a limited time. Terms and conditions apply.
              </p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        tone: 'professional',
        callToAction: 'Claim Your Offer Now',
        variables: ['campaignName', 'offerValue', 'customerName'],
        estimatedOpenRate: '24%',
        estimatedClickRate: '3.2%'
      },
      {
        id: `email_template_2_${Date.now()}`,
        name: "Urgent Last Chance",
        subject: `⏰ Last Chance: ${getOfferText()} expires soon!`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ff6b6b; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">⏰ Last Chance!</h1>
              <p style="margin: 10px 0 0; font-size: 16px;">Your exclusive offer expires soon</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Don't let this opportunity slip away!</h2>
              
              <div style="background: #fff5f5; border: 2px dashed #ff6b6b; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #ff6b6b; margin: 0 0 10px;">🔥 Limited Time Offer</h3>
                <p style="font-size: 20px; font-weight: bold; color: #333; margin: 0;">
                  ${getOfferText().toUpperCase()} ON ${getProductMentions().toUpperCase()}
                </p>
                <p style="color: #ff6b6b; font-weight: bold; margin: 10px 0 0;">EXPIRES IN 24 HOURS!</p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                This is your final reminder about our exclusive ${campaignName.toLowerCase()}. 
                Secure your savings before this amazing deal disappears forever.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
                  SECURE MY DISCOUNT NOW →
                </a>
              </div>
              
              <div style="background: #fffacd; border-left: 4px solid #ffd700; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #b8860b; font-weight: bold;">
                  💡 Pro Tip: Customers who book within the next 6 hours get an additional surprise bonus!
                </p>
              </div>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>Don't wait - book now!<br>The ${companyName} Team</p>
            </div>
          </div>
        `,
        tone: 'urgent',
        callToAction: 'SECURE MY DISCOUNT NOW',
        variables: ['offerValue', 'expiryTime', 'customerName'],
        estimatedOpenRate: '31%',
        estimatedClickRate: '5.8%'
      },
      {
        id: `email_template_3_${Date.now()}`,
        name: "Personalized Recommendation",
        subject: `✈️ Perfect for your next trip: ${getOfferText()} on ${getProductMentions()}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">✈️ Recommended Just For You</h1>
              <p style="margin: 10px 0 0; font-size: 16px;">Based on your travel preferences</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Hi there! 👋
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                We noticed you're planning your next adventure, and we have something special that caught our attention. 
                Our ${campaignName.toLowerCase()} is perfectly tailored for travelers like you.
              </p>
              
              <div style="background: #f0f7ff; border-radius: 10px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0984e3; margin: 0 0 15px; display: flex; align-items: center;">
                  🎯 Your Personalized Offer
                </h3>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <p style="font-size: 18px; font-weight: bold; color: #333; margin: 0 0 10px;">
                    ${getOfferText()} on ${getProductMentions()}
                  </p>
                  <p style="color: #666; margin: 0;">Perfect for enhancing your travel experience</p>
                </div>
              </div>
              
              <div style="background: #fff9e6; border-left: 4px solid #ffa500; padding: 20px; margin: 20px 0;">
                <h4 style="color: #ff8c00; margin: 0 0 10px;">Why this offer is perfect for you:</h4>
                <ul style="color: #666; margin: 0; padding-left: 20px;">
                  <li>Specially selected based on your travel history</li>
                  <li>Premium quality services at unbeatable prices</li>
                  <li>Flexible booking and cancellation options</li>
                  <li>24/7 customer support included</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #0984e3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Explore This Offer →
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; text-align: center;">
                Have questions? Reply to this email - we're here to help! 💬
              </p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>Happy travels!<br>Your friends at ${companyName}</p>
            </div>
          </div>
        `,
        tone: 'friendly',
        callToAction: 'Explore This Offer',
        variables: ['customerName', 'travelHistory', 'offerDetails'],
        estimatedOpenRate: '28%',
        estimatedClickRate: '4.1%'
      }
    ];
  } 
  
  else if (type === 'whatsapp') {
    return [
      {
        id: `whatsapp_template_1_${Date.now()}`,
        name: "Quick Offer Alert",
        message: `🎯 Hi! Exclusive ${getOfferText()} on ${getProductMentions()} - just for you!\n\n✈️ Perfect for your next trip\n⏰ Limited time offer\n\nInterested? Reply YES for details!`,
        style: 'conversational',
        variables: ['customerName', 'offerValue', 'productName'],
        estimatedDeliveryRate: '98%',
        estimatedReadRate: '87%'
      },
      {
        id: `whatsapp_template_2_${Date.now()}`,
        name: "Friendly Reminder",
        message: `Hey! 👋 Don't miss out on our ${campaignName}!\n\n🔥 ${getOfferText()} on ${getProductMentions()}\n📅 Valid until tomorrow\n\nBook now: [LINK]\n\nQuestions? Just reply here! 😊`,
        style: 'friendly',
        variables: ['campaignName', 'offerDetails', 'expiryDate'],
        estimatedDeliveryRate: '98%',
        estimatedReadRate: '85%'
      },
      {
        id: `whatsapp_template_3_${Date.now()}`,
        name: "Urgent Alert",
        message: `⚡ LAST CHANCE! Your ${getOfferText()} expires in 6 hours!\n\n${getProductMentions().toUpperCase()} - Special pricing\n\n👆 Don't wait - secure now!\nReply BOOK to claim`,
        style: 'urgent',
        variables: ['offerValue', 'expiryTime', 'productCode'],
        estimatedDeliveryRate: '98%',
        estimatedReadRate: '92%'
      },
      {
        id: `whatsapp_template_4_${Date.now()}`,
        name: "Value Proposition",
        message: `✈️ Planning your next trip?\n\nWe've got something special:\n🎁 ${getOfferText()} on ${getProductMentions()}\n💰 Save big on premium services\n🌟 Trusted by 50,000+ travelers\n\nReady to save? Reply YES`,
        style: 'informative',
        variables: ['offerType', 'savings', 'customerCount'],
        estimatedDeliveryRate: '98%',
        estimatedReadRate: '83%'
      }
    ];
  }
  
  return [];
}


const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Registering routes...");

  // AI Template Generation endpoint
  app.post("/api/ai/generate-templates", async (req, res) => {
    try {
      const { type, context } = req.body;

      if (!type || !['email', 'whatsapp'].includes(type)) {
        return res.status(400).json({ message: "Invalid template type" });
      }

      // Generate templates based on context
      const templates = await generateAITemplates(type, context);

      res.json(templates);
    } catch (error) {
      console.error("Template generation error:", error);
      res.status(500).json({ message: "Failed to generate templates" });
    }
  });

  // Negotiated Fares Routes

  // Get all negotiated fares with optional filters
  app.get("/api/negofares", async (req, res) => {
    try {
      const filters = req.query;
      const fares = await storage.getNegotiatedFares(filters);
      res.json(fares);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch negotiated fares", error: error.message });
    }
  });

  // Create single negotiated fare
  app.post("/api/negofares", async (req, res) => {
    try {
      const validatedData = insertNegotiatedFareSchema.parse(req.body);
      const user = req.header("x-user") || "system";

      // Check for conflicts
      const conflicts = await storage.checkFareConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Fare conflicts detected", 
          conflicts 
        });
      }

      const fare = await storage.withAuditLog(
        () => storage.insertNegotiatedFare(validatedData),
        {
          user,
          module: "NegotiatedFare",
          entityId: validatedData.fareCode,
          action: "CREATED",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          sessionId: req.sessionID || "unknown",
        }
      );

      res.status(201).json(fare);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid fare data", error: error.message });
    }
  });

  // Upload CSV/Excel file
  app.post("/api/negofares/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results: any[] = [];
      const errors: any[] = [];
      const conflicts: any[] = [];

      // Parse CSV
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on("data", async (data) => {
          try {
            // Transform CSV data to match schema
            const transformedData = {
              airlineCode: data.airlineCode,
              fareCode: data.fareCode,
              origin: data.origin,
              destination: data.destination,
              tripType: data.tripType,
              cabinClass: data.cabinClass,
              baseNetFare: data.baseNetFare,
              currency: data.currency,
              bookingStartDate: data.bookingStartDate,
              bookingEndDate: data.bookingEndDate,
              travelStartDate: data.travelStartDate,
              travelEndDate: data.travelEndDate,
              pos: JSON.parse(data.pos || "[]"),
              seatAllotment: data.seatAllotment ? parseInt(data.seatAllotment) : null,
              minStay: data.minStay ? parseInt(data.minStay) : null,
              maxStay: data.maxStay ? parseInt(data.maxStay) : null,
              blackoutDates: data.blackoutDates ? JSON.parse(data.blackoutDates) : null,
              eligibleAgentTiers: JSON.parse(data.eligibleAgentTiers || '["BRONZE"]'),
              eligibleCohorts: data.eligibleCohorts ? JSON.parse(data.eligibleCohorts) : null,
              remarks: data.remarks || null,
            };

            const validatedData = insertNegotiatedFareSchema.parse(transformedData);

            // Check for conflicts
            const fareConflicts = await storage.checkFareConflicts(validatedData);
            if (fareConflicts.length > 0) {
              conflicts.push({ data: validatedData, conflicts: fareConflicts });
            } else {
              results.push(validatedData);
            }
          } catch (error: any) {
            errors.push({ data, error: error.message });
          }
        })
        .on("end", async () => {
          try {
            // Insert valid fares
            const insertedFares: any[] = [];
            for (const fareData of results) {
              const fare = await storage.insertNegotiatedFare(fareData);
              insertedFares.push(fare);
            }

            res.json({
              success: true,
              inserted: insertedFares.length,
              conflicts: conflicts.length,
              errors: errors.length,
              data: {
                insertedFares,
                conflicts,
                errors,
              },
            });
          } catch (error: any) {
            res.status(500).json({ message: "Failed to insert fares", error: error.message });
          }
        });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to process upload", error: error.message });
    }
  });

  // Get fare by ID
  app.get("/api/negofares/:id", async (req, res) => {
    try {
      const fare = await storage.getNegotiatedFareById(req.params.id);
      if (!fare) {
        return res.status(404).json({ message: "Fare not found" });
      }
      res.json(fare);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch fare", error: error.message });
    }
  });

  // Update fare
  app.put("/api/negofares/:id", async (req, res) => {
    try {
      const validatedData = insertNegotiatedFareSchema.parse(req.body);
      const user = req.header("x-user") || "system";
      const justification = req.body.justification || "Fare update";

      const fare = await storage.withAuditLog(
        () => storage.updateNegotiatedFare(req.params.id, validatedData),
        {
          user,
          module: "NegotiatedFare",
          entityId: req.params.id,
          action: "UPDATED",
          justification,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          sessionId: req.sessionID || "unknown",
        },
        () => storage.getNegotiatedFareById(req.params.id)
      );

      res.json(fare);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update fare", error: error.message });
    }
  });

  // Update fare status
  app.patch("/api/negofares/:id/status", async (req, res) => {
    try {
      const { status, justification } = req.body;
      const user = req.header("x-user") || "system";

      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const fare = await storage.withAuditLog(
        () => storage.updateNegotiatedFareStatus(req.params.id, status),
        {
          user,
          module: "NegotiatedFare",
          entityId: req.params.id,
          action: "STATUS_CHANGED",
          justification: justification || `Status changed to ${status}`,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          sessionId: req.sessionID || "unknown",
        },
        () => storage.getNegotiatedFareById(req.params.id)
      );

      res.json(fare);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update fare status", error: error.message });
    }
  });

  // Delete fare
  app.delete("/api/negofares/:id", async (req, res) => {
    try {
      await storage.deleteNegotiatedFare(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete fare", error: error.message });
    }
  });

  // Dynamic Discount Rules Routes

  // Get all dynamic discount rules with optional filters
  app.get("/api/dynamic-discount-rules", async (req, res) => {
    try {
      const filters = req.query;
      const rules = await storage.getDynamicDiscountRules(filters);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch discount rules", error: error.message });
    }
  });

  // Create single dynamic discount rule
  app.post("/api/dynamic-discount-rules", async (req, res) => {
    try {
      console.log("Received rule data:", req.body);

      const validatedData = insertDynamicDiscountRuleSchema.parse(req.body);
      console.log("Validated rule data:", validatedData);

      // Check for conflicts
      const conflicts = await storage.checkDiscountRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertDynamicDiscountRule(validatedData);
      console.log("Created rule:", rule);

      res.status(201).json(rule);
    } catch (error: any) {
      console.error("Error creating rule:", error);

      if (error.errors && Array.isArray(error.errors)) {
        // Zod validation errors
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors,
          error: error.message 
        });
      }

      res.status(400).json({ message: "Invalid rule data", error: error.message });
    }
  });

  // Simulate discount rule application
  app.post("/api/dynamic-discount-rules/simulate", async (req, res) => {
    try {
      const { baseFare, currency, ruleId } = req.body;

      if (!baseFare || !currency || !ruleId) {
        return res.status(400).json({ message: "baseFare, currency, and ruleId are required" });
      }

      const rule = await storage.getDynamicDiscountRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }

      let adjustedFare = parseFloat(baseFare);
      if (rule.adjustmentType === "PERCENT") {
        adjustedFare = baseFare * (1 + parseFloat(rule.adjustmentValue) / 100);
      } else if (rule.adjustmentType === "AMOUNT") {
        adjustedFare = baseFare + parseFloat(rule.adjustmentValue);
      }

      res.json({
        baseFare: parseFloat(baseFare),
        adjustedFare: Math.round(adjustedFare * 100) / 100,
        adjustment: {
          type: rule.adjustmentType,
          value: parseFloat(rule.adjustmentValue)
        },
        currency,
        ruleApplied: rule.ruleCode
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate rule", error: error.message });
    }
  });

  // Get rule by ID
  app.get("/api/dynamic-discount-rules/:id", async (req, res) => {
    try {
      const rule = await storage.getDynamicDiscountRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch rule", error: error.message });
    }
  });

  // Update rule
  app.put("/api/dynamic-discount-rules/:id", async (req, res) => {
    try {
      const validatedData = insertDynamicDiscountRuleSchema.parse(req.body);
      const rule = await storage.updateDynamicDiscountRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update rule", error: error.message });
    }
  });

  // Update rule status
  app.patch("/api/dynamic-discount-rules/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const rule = await storage.updateDynamicDiscountRuleStatus(req.params.id, status);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update rule status", error: error.message });
    }
  });

  // Delete rule
  app.delete("/api/dynamic-discount-rules/:id", async (req, res) => {
    try {
      await storage.deleteDynamicDiscountRule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
  });

  // Air Ancillary Rules Routes

  // Get all air ancillary rules with optional filters
  app.get("/api/air-ancillary-rules", async (req, res) => {
    try {
      const filters = req.query;
      const rules = await storage.getAirAncillaryRules(filters);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch air ancillary rules", error: error.message });
    }
  });

  // Create single air ancillary rule
  app.post("/api/air-ancillary-rules", async (req, res) => {
    try {
      const validatedData = insertAirAncillaryRuleSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkAirAncillaryRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertAirAncillaryRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid rule data", error: error.message });
    }
  });

  // Simulate air ancillary rule application
  app.post("/api/air-ancillary-rules/simulate", async (req, res) => {
    try {
      const { basePrice, currency, ruleId } = req.body;

      if (!basePrice || !currency || !ruleId) {
        return res.status(400).json({ message: "basePrice, currency, and ruleId are required" });
      }

      const rule = await storage.getAirAncillaryRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }

      let adjustedPrice = parseFloat(basePrice);
      let discount = 0;

      if (rule.adjustmentType === "FREE") {
        adjustedPrice = 0;
        discount = parseFloat(basePrice);
      } else if (rule.adjustmentType === "PERCENT" && rule.adjustmentValue) {
        discount = basePrice * (parseFloat(rule.adjustmentValue) / 100);
        adjustedPrice = basePrice - discount;
      } else if (rule.adjustmentType === "AMOUNT" && rule.adjustmentValue) {
        discount = parseFloat(rule.adjustmentValue);
        adjustedPrice = Math.max(0, basePrice - discount);
      }

      res.json({
        basePrice: parseFloat(basePrice),
        adjustedPrice: Math.round(adjustedPrice * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        adjustment: {
          type: rule.adjustmentType,
          value: rule.adjustmentValue ? parseFloat(rule.adjustmentValue) : 0
        },
        currency,
        ruleApplied: rule.ruleCode,
        ancillaryCode: rule.ancillaryCode
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate rule", error: error.message });
    }
  });

  // Get rule by ID
  app.get("/api/air-ancillary-rules/:id", async (req, res) => {
    try {
      const rule = await storage.getAirAncillaryRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch rule", error: error.message });
    }
  });

  // Update rule
  app.put("/api/air-ancillary-rules/:id", async (req, res) => {
    try {
      const validatedData = insertAirAncillaryRuleSchema.parse(req.body);
      const rule = await storage.updateAirAncillaryRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update rule", error: error.message });
    }
  });

  // Update rule status
  app.patch("/api/air-ancillary-rules/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const rule = await storage.updateAirAncillaryRuleStatus(req.params.id, status);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update rule status", error: error.message });
    }
  });

  // Delete rule
  app.delete("/api/air-ancillary-rules/:id", async (req, res) => {
    try {
      await storage.deleteAirAncillaryRule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
  });

  // Get ancillary products for dropdowns
  app.get("/api/ancillary-products", async (req, res) => {
    try {
      const rules = await storage.getAirAncillaryRules({ status: "ACTIVE" });
      // Group by ancillary code and return unique ancillary products
      const products = rules.reduce((acc: any[], rule) => {
        const existing = acc.find(p => p.ancillaryCode === rule.ancillaryCode);
        if (!existing) {
          acc.push({
            id: rule.id,
            ruleCode: rule.ruleCode,
            ancillaryCode: rule.ancillaryCode,
            adjustmentType: rule.adjustmentType,
            adjustmentValue: rule.adjustmentValue,
            pos: rule.pos,
            agentTier: rule.agentTier
          });
        }
        return acc;
      }, []);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch ancillary products", error: error.message });
    }
  });

  // Non-Air Rates Routes

  // Get all non-air rates with optional filters
  app.get("/api/nonair/rates", async (req, res) => {
    try {
      const filters = req.query;
      const rates = await storage.getNonAirRates(filters);
      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch non-air rates", error: error.message });
    }
  });

  // Create single non-air rate
  app.post("/api/nonair/rates", async (req, res) => {
    try {
      const validatedData = insertNonAirRateSchema.parse(req.body);
      const rate = await storage.insertNonAirRate(validatedData);
      res.status(201).json(rate);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid rate data", error: error.message });
    }
  });

  // Upload CSV/Excel file for non-air rates
  app.post("/api/nonair/rates/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results: any[] = [];
      const errors: any[] = [];

      // Parse CSV
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on("data", async (data) => {
          try {
            // Transform CSV data to match schema
            const transformedData = {
              supplierCode: data.supplierCode,
              productCode: data.productCode,
              productName: data.productName,
              netRate: data.netRate,
              currency: data.currency,
              region: JSON.parse(data.region || "[]"),
              validFrom: data.validFrom,
              validTo: data.validTo,
              inventory: data.inventory ? parseInt(data.inventory) : null,
            };

            const validatedData = insertNonAirRateSchema.parse(transformedData);
            results.push(validatedData);
          } catch (error: any) {
            errors.push({ data, error: error.message });
          }
        })
        .on("end", async () => {
          try {
            // Insert valid rates
            const insertedRates: any[] = [];
            for (const rateData of results) {
              const rate = await storage.insertNonAirRate(rateData);
              insertedRates.push(rate);
            }

            res.json({
              success: true,
              inserted: insertedRates.length,
              errors: errors.length,
              data: {
                insertedRates,
                errors,
              },
            });
          } catch (error: any) {
            res.status(500).json({ message: "Failed to insert rates", error: error.message });
          }
        });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to process upload", error: error.message });
    }
  });

  // Get rate by ID
  app.get("/api/nonair/rates/:id", async (req, res) => {
    try {
      const rate = await storage.getNonAirRateById(req.params.id);
      if (!rate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      res.json(rate);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch rate", error: error.message });
    }
  });

  // Update rate
  app.put("/api/nonair/rates/:id", async (req, res) => {
    try {
      const validatedData = insertNonAirRateSchema.parse(req.body);
      const rate = await storage.updateNonAirRate(req.params.id, validatedData);
      res.json(rate);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update rate", error: error.message });
    }
  });

  // Update rate status
  app.patch("/api/nonair/rates/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const rate = await storage.updateNonAirRateStatus(req.params.id, status);
      res.json(rate);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update rate status", error: error.message });
    }
  });

  // Delete rate
  app.delete("/api/nonair/rates/:id", async (req, res) => {
    try {
      await storage.deleteNonAirRate(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete rate", error: error.message });
    }
  });

  // Non-Air Markup Rules Routes

  // Get all non-air markup rules with optional filters
  app.get("/api/nonair/rules", async (req, res) => {
    try {
      const filters = req.query;
      const rules = await storage.getNonAirMarkupRules(filters);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch markup rules", error: error.message });
    }
  });

  // Create single non-air markup rule
  app.post("/api/nonair/rules", async (req, res) => {
    try {
      const validatedData = insertNonAirMarkupRuleSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkNonAirMarkupRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertNonAirMarkupRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid rule data", error: error.message });
    }
  });

  // Simulate non-air markup rule application
  app.post("/api/nonair/rules/simulate", async (req, res) => {
    try {
      const { baseRate, currency, ruleId } = req.body;

      if (!baseRate || !currency || !ruleId) {
        return res.status(400).json({ message: "baseRate, currency, and ruleId are required" });
      }

      const rule = await storage.getNonAirMarkupRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }

      let adjustedRate = parseFloat(baseRate);
      let markup = 0;

      if (rule.adjustmentType === "PERCENT") {
        markup = baseRate * (parseFloat(rule.adjustmentValue) / 100);
        adjustedRate = baseRate + markup;
      } else if (rule.adjustmentType === "AMOUNT") {
        markup = parseFloat(rule.adjustmentValue);
        adjustedRate = baseRate + markup;
      }

      res.json({
        baseRate: parseFloat(baseRate),
        adjustedRate: Math.round(adjustedRate * 100) / 100,
        markup: Math.round(markup * 100) / 100,
        adjustment: {
          type: rule.adjustmentType,
          value: parseFloat(rule.adjustmentValue)
        },
        currency,
        ruleApplied: rule.ruleCode,
        productCode: rule.productCode
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate rule", error: error.message });
    }
  });

  // Get rule by ID
  app.get("/api/nonair/rules/:id", async (req, res) => {
    try {
      const rule = await storage.getNonAirMarkupRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch rule", error: error.message });
    }
  });

  // Update rule
  app.put("/api/nonair/rules/:id", async (req, res) => {
    try {
      const validatedData = insertNonAirMarkupRuleSchema.parse(req.body);
      const rule = await storage.updateNonAirMarkupRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update rule", error: error.message });
    }
  });

  // Update rule status
  app.patch("/api/nonair/rules/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const rule = await storage.updateNonAirMarkupRuleStatus(req.params.id, status);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update rule status", error: error.message });
    }
  });

  // Delete rule
  app.delete("/api/nonair/rules/:id", async (req, res) => {
    try {
      await storage.deleteNonAirMarkupRule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
  });

  // Bundle Pricing Rules Routes (Register BEFORE general bundle routes to avoid conflicts)

  // Get all bundle pricing rules with optional filters  
  app.get("/api/bundles/pricing", async (req, res) => {
    try {
      const filters = req.query || {};
      console.log("API: Fetching bundle pricing rules with filters:", filters);

      let rules = await storage.getBundlePricingRules(filters);
      console.log(`API: Found ${rules?.length || 0} bundle pricing rules`);

      // Ensure we always return an array
      if (!Array.isArray(rules)) {
        console.log("API: Rules is not an array, converting to empty array");
        rules = [];
      }

      // If no pricing rules exist and no specific filters, create sample data
      if (rules.length === 0 && Object.keys(filters).length === 0) {
        console.log("API: No bundle pricing rules found, creating sample rules...");

        // First ensure we have sample bundles
        const existingBundles = await storage.getBundles({ status: "ACTIVE" });
        const bundleCodes = existingBundles.map(b => b.bundleCode);

        if (bundleCodes.length > 0) {
          try {
            const samplePricingRules = [
              {
                ruleCode: "BUNDLE_DISC_10",
                bundleCode: bundleCodes[0],
                discountType: "PERCENT",
                discountValue: "10.00",
                priority: 1,
                status: "ACTIVE",
                validFrom: "2024-01-01",
                validTo: "2024-12-31"
              },
              {
                ruleCode: "BUNDLE_DISC_15",
                bundleCode: bundleCodes[1] || bundleCodes[0],
                discountType: "PERCENT", 
                discountValue: "15.00",
                priority: 2,
                status: "ACTIVE",
                validFrom: "2024-01-01",
                validTo: "2024-12-31"
              },
              {
                ruleCode: "BUNDLE_DISC_FLAT_500",
                bundleCode: bundleCodes[2] || bundleCodes[0],
                discountType: "AMOUNT",
                discountValue: "500.00",
                priority: 3,
                status: "ACTIVE",
                validFrom: "2024-01-01",
                validTo: "2024-12-31"
              }
            ];

            for (const ruleData of samplePricingRules) {
              try {
                await storage.insertBundlePricingRule(ruleData);
                console.log(`API: Created pricing rule: ${ruleData.ruleCode}`);
              } catch (ruleError) {
                console.error(`API: Error creating pricing rule ${ruleData.ruleCode}:`, ruleError);
              }
            }

            // Refetch after creating samples
            rules = await storage.getBundlePricingRules(filters);
            console.log(`API: After sample creation: ${rules?.length || 0} bundle pricing rules`);
          } catch (createError: any) {
            console.error("API: Error creating sample bundle pricing rules:", createError);
          }
        }
      }

      console.log(`API: Returning ${rules.length} bundle pricing rules`);
      res.json(rules);
    } catch (error: any) {
      console.error("API: Error in /api/bundles/pricing endpoint:", error);
      res.status(500).json({ 
        message: "Failed to fetch bundle pricing rules", 
        error: error.message
      });
    }
  });

  // Create single bundle pricing rule
  app.post("/api/bundles/pricing", async (req, res) => {
    try {
      const validatedData = insertBundlePricingRuleSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkBundlePricingRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Bundle pricing rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertBundlePricingRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid bundle pricing rule data", error: error.message });
    }
  });

  // Simulate bundle pricing application
  app.post("/api/bundles/pricing/simulate", async (req, res) => {
    try {
      const { basePrice, currency, ruleId } = req.body;

      if (!basePrice || !currency || !ruleId) {
        return res.status(400).json({ message: "basePrice, currency, and ruleId are required" });
      }

      const rule = await storage.getBundlePricingRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Bundle pricing rule not found" });
      }

      let adjustedPrice = parseFloat(basePrice);
      let discount = 0;

      if (rule.discountType === "PERCENT") {
        discount = basePrice * (parseFloat(rule.discountValue) / 100);
        adjustedPrice = basePrice - discount;
      } else if (rule.discountType === "AMOUNT") {
        discount = parseFloat(rule.discountValue);
        adjustedPrice = Math.max(0, basePrice - discount);
      }

      res.json({
        basePrice: parseFloat(basePrice),
        adjustedPrice: Math.round(adjustedPrice * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        discountType: rule.discountType,
        discountValue: parseFloat(rule.discountValue),
        currency,
        ruleApplied: rule.ruleCode,
        bundleCode: rule.bundleCode
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate bundle pricing rule", error: error.message });
    }
  });

  // Get bundle pricing rule by ID
  app.get("/api/bundles/pricing/:id", async (req, res) => {
    try {
      const rule = await storage.getBundlePricingRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Bundle pricing rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bundle pricing rule", error: error.message });
    }
  });

  // Update bundle pricing rule
  app.put("/api/bundles/pricing/:id", async (req, res) => {
    try {
      const validatedData = insertBundlePricingRuleSchema.parse(req.body);
      const rule = await storage.updateBundlePricingRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update bundle pricing rule", error: error.message });
    }
  });

  // Update bundle pricing rule status
  app.patch("/api/bundles/pricing/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const rule = await storage.updateBundlePricingRuleStatus(req.params.id, status);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update bundle pricing rule status", error: error.message });
    }
  });

  // Delete bundle pricing rule
  app.delete("/api/bundles/pricing/:id", async (req, res) => {
    try {
      await storage.deleteBundlePricingRule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete bundle pricing rule", error: error.message });
    }
  });

  console.log("Bundle pricing routes registered successfully at /api/bundles/pricing");

  // Bundle Routes (General bundle routes - placed AFTER pricing routes)

  // Get all bundles with optional filters
  app.get("/api/bundles", async (req, res) => {
    try {
      console.log("API: Fetching bundles with filters:", req.query);
      const filters = req.query;
      const bundles = await storage.getBundles(filters);
      res.json(bundles);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bundles", error: error.message });
    }
  });

  // Create single bundle
  app.post("/api/bundles", async (req, res) => {
    try {
      const validatedData = insertBundleSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkBundleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Bundle conflicts detected", 
          conflicts 
        });
      }

      const bundle = await storage.insertBundle(validatedData);
      res.status(201).json(bundle);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid bundle data", error: error.message });
    }
  });

  // Get bundle by ID
  app.get("/api/bundles/:id", async (req, res) => {
    try {
      const bundle = await storage.getBundleById(req.params.id);
      if (!bundle) {
        return res.status(404).json({ message: "Bundle not found" });
      }
      res.json(bundle);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bundle", error: error.message });
    }
  });

  // Update bundle
  app.put("/api/bundles/:id", async (req, res) => {
    try {
      const validatedData = insertBundleSchema.parse(req.body);
      const bundle = await storage.updateBundle(req.params.id, validatedData);
      res.json(bundle);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update bundle", error: error.message });
    }
  });

  // Update bundle status
  app.patch("/api/bundles/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const bundle = await storage.updateBundleStatus(req.params.id, status);
      res.json(bundle);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update bundle status", error: error.message });
    }
  });

  // Delete bundle
  app.delete("/api/bundles/:id", async (req, res) => {
    try {
      await storage.deleteBundle(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete bundle", error: error.message });
    }
  });

  console.log("General bundle routes registered successfully");

  // Offer Rules Routes

  // Get all offer rules with optional filters
  app.get("/api/offer-rules", async (req, res) => {
    try {
      const filters = req.query;
      const rules = await storage.getOfferRules(filters);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch offer rules", error: error.message });
    }
  });

  // Create single offer rule
  app.post("/api/offer-rules", async (req, res) => {
    try {
      console.log("Received offer rule data:", req.body);

      const validatedData = insertOfferRuleSchema.parse(req.body);
      console.log("Validated offer rule data:", validatedData);

      // Check for conflicts
      const conflicts = await storage.checkOfferRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertOfferRule(validatedData);
      console.log("Created offer rule:", rule);

      res.status(201).json(rule);
    } catch (error: any) {
      console.error("Error creating offer rule:", error);

      if (error.errors && Array.isArray(error.errors)) {
        // Zod validation errors
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors,
          error: error.message 
        });
      }

      res.status(400).json({ message: "Invalid rule data", error: error.message });
    }
  });

  // Simulate offer rule application
  app.post("/api/offer-rules/simulate", async (req, res) => {
    try {
      const { ruleId, context } = req.body;

      if (!ruleId || !context) {
        return res.status(400).json({ message: "ruleId and context are required" });
      }

      const rule = await storage.getOfferRuleById(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }

      // Basic simulation logic
      const simulation = {
        ruleApplied: rule.ruleCode,
        ruleName: rule.ruleName,
        ruleType: rule.ruleType,
        conditions: rule.conditions,
        actions: rule.actions,
        context,
        result: "Rule would be applied based on matching conditions"
      };

      res.json(simulation);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate rule", error: error.message });
    }
  });

  // Get rule by ID
  app.get("/api/offer-rules/:id", async (req, res) => {
    try {
      const rule = await storage.getOfferRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch rule", error: error.message });
    }
  });

  // Update rule
  app.put("/api/offer-rules/:id", async (req, res) => {
    try {
      const validatedData = insertOfferRuleSchema.parse(req.body);
      const rule = await storage.updateOfferRule(req.params.id, validatedData);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update rule", error: error.message });
    }
  });

  // Update rule status (with approval workflow)
  app.patch("/api/offer-rules/:id/status", async (req, res) => {
    try {
      const { status, approver } = req.body;
      if (!status || !["DRAFT", "PENDING_APPROVAL", "ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const rule = await storage.updateOfferRuleStatus(req.params.id, status, approver);
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update rule status", error: error.message });
    }
  });

  // Delete rule
  app.delete("/api/offer-rules/:id", async (req, res) => {
    try {
      await storage.deleteOfferRule(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
  });

  // Offer Composition Routes

  // Compose offer for agent
  app.post("/api/offer/compose", async (req, res) => {
    try {
      const { origin, destination, tripType, pax, cabinClass, dates, channel, agentId } = req.body;

      if (!origin || !destination || !agentId) {
        return res.status(400).json({ message: "origin, destination, and agentId are required" });
      }

      // Generate trace ID
      const traceId = `TRC-${Math.random().toString(36).substr(2, 5)}`;
      const auditTraceId = `AUD-${Math.random().toString(36).substr(2, 5)}`;

      // Mock agent tier resolution (in real implementation, this would query agent database)
      const agentTier = "PLATINUM";
      const cohorts = ["FESTIVE_2025", "PORTAL_USERS"];

      // Step 1: Check for negotiated fares
      const negotiatedFareFilters = {
        origin,
        destination,
        cabinClass,
        tripType,
        status: "ACTIVE"
      };

      const negotiatedFares = await storage.getNegotiatedFares(negotiatedFareFilters);
      let fareSource = "API";
      let basePrice = 8500; // Mock API fare price
      let adjustments = [];

      if (negotiatedFares.length > 0) {
        fareSource = "NEGOTIATED";
        basePrice = parseFloat(negotiatedFares[0].baseNetFare);
      }

      // Step 2: Apply dynamic discount rules
      const discountFilters = {
        origin,
        destination,
        cabinClass,
        tripType,
        channel,
        status: "ACTIVE"
      };

      const discountRules = await storage.getDynamicDiscountRules(discountFilters);

      for (const rule of discountRules) {
        // Check if rule applies to agent tier
        const agentTierArray = Array.isArray(rule.agentTier) ? rule.agentTier : [];
        const posArray = Array.isArray(rule.pos) ? rule.pos : [];

        if (agentTierArray.includes(agentTier)) {
          const originalPrice = basePrice;
          if (rule.adjustmentType === "PERCENT") {
            const adjustmentValue = parseFloat(rule.adjustmentValue);
            basePrice = basePrice * (1 + adjustmentValue / 100);
            adjustments.push({
              rule: rule.ruleCode,
              ruleName: `${rule.ruleCode} (${rule.adjustmentType})`,
              type: "PERCENT",
              value: adjustmentValue,
              originalPrice: originalPrice,
              adjustedPrice: basePrice,
              priority: rule.priority
            });
          } else if (rule.adjustmentType === "AMOUNT") {
            const adjustmentValue = parseFloat(rule.adjustmentValue);
            basePrice = basePrice + adjustmentValue;
            adjustments.push({
              rule: rule.ruleCode,
              ruleName: `${rule.ruleCode} (${rule.adjustmentType})`,
              type: "AMOUNT",
              value: adjustmentValue,
              originalPrice: originalPrice,
              adjustedPrice: basePrice,
              priority: rule.priority
            });
          }
        }
      }

      // Step 3: Add ancillary offers
      const ancillaryFilters = {
        status: "ACTIVE"
      };

      const ancillaryRules = await storage.getAirAncillaryRules(ancillaryFilters);
      const ancillaries = [];

      for (const rule of ancillaryRules) {
        const agentTierArray = Array.isArray(rule.agentTier) ? rule.agentTier : [];

        if (agentTierArray.includes(agentTier)) {
          let baseAncillaryPrice = 2000; // Mock base price
          let sellPrice = baseAncillaryPrice;
          let discount = 0;

          if (rule.adjustmentType === "FREE") {
            sellPrice = 0;
            discount = baseAncillaryPrice;
          } else if (rule.adjustmentType === "PERCENT" && rule.adjustmentValue) {
            discount = baseAncillaryPrice * (parseFloat(rule.adjustmentValue) / 100);
            sellPrice = baseAncillaryPrice - discount;
          } else if (rule.adjustmentType === "AMOUNT" && rule.adjustmentValue) {
            discount = parseFloat(rule.adjustmentValue);
            sellPrice = Math.max(0, baseAncillaryPrice - discount);
          }

          ancillaries.push({
            code: rule.ancillaryCode,
            base: baseAncillaryPrice,
            discount: Math.round(discount),
            sell: Math.round(sellPrice)
          });
        }
      }

      // Step 4: Add bundle offers
      const bundleFilters = {
        status: "ACTIVE"
      };

      const availableBundles = await storage.getBundles(bundleFilters);
      const bundles = [];

      for (const bundle of availableBundles) {
        const agentTierArray = Array.isArray(bundle.agentTier) ? bundle.agentTier : [];
        const posArray = Array.isArray(bundle.pos) ? bundle.pos : [];

        if (agentTierArray.includes(agentTier)) {
          const bundlePricingFilters = {
            bundleCode: bundle.bundleCode,
            status: "ACTIVE"
          };

          const pricingRules = await storage.getBundlePricingRules(bundlePricingFilters);
          let bundlePrice = 3000; // Mock base bundle price
          let saveVsIndiv = 600;

          if (pricingRules.length > 0) {
            const rule = pricingRules[0];
            if (rule.discountType === "PERCENT") {
              const discount = bundlePrice * (parseFloat(rule.discountValue) / 100);
              bundlePrice = bundlePrice - discount;
              saveVsIndiv = Math.round(discount);
            } else if (rule.discountType === "AMOUNT") {
              const discount = parseFloat(rule.discountValue);
              bundlePrice = Math.max(0, bundlePrice - discount);
              saveVsIndiv = Math.round(discount);
            }
          }

          bundles.push({
            code: bundle.bundleCode,
            sell: Math.round(bundlePrice),
            saveVsIndiv: saveVsIndiv
          });
        }
      }

      // Step 5: Calculate final offer price and commission
      const ancillaryTotal = ancillaries.reduce((total, anc) => total + anc.sell, 0);
      const bundleTotal = bundles.reduce((total, bundle) => total + bundle.sell, 0);
      const finalOfferPrice = Math.round(basePrice + ancillaryTotal + bundleTotal);
      const commission = Math.round(finalOfferPrice * 0.03); // 3% commission

      // Create offer trace
      const offerTrace = {
        traceId,
        agentId,
        searchParams: {
          origin,
          destination,
          tripType: tripType || "ROUND_TRIP",
          pax: pax || [{ type: "ADT", count: 1 }],
          cabinClass: cabinClass || "ECONOMY",
          dates: dates || { depart: "2025-11-10", return: "2025-11-20" },
          channel: channel || "PORTAL"
        },
        agentTier,
        cohorts,
        fareSource,
        basePrice: basePrice.toString(),
        adjustments,
        ancillaries,
        bundles,
        finalOfferPrice: finalOfferPrice.toString(),
        commission: commission.toString(),
        auditTraceId
      };

      const savedTrace = await storage.insertOfferTrace(offerTrace);

      // Return offer response
      res.json({
        traceId,
        agentTier,
        cohorts,
        fareSource,
        basePrice: Math.round(basePrice),
        adjustments,
        ancillaries,
        bundles,
        finalOfferPrice,
        commission,
        auditTraceId
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to compose offer", error: error.message });
    }
  });

  // Get offer trace by traceId
  app.get("/api/offer/trace/:traceId", async (req, res) => {
    try {
      const trace = await storage.getOfferTraceByTraceId(req.params.traceId);
      if (!trace) {
        return res.status(404).json({ message: "Offer trace not found" });
      }
      res.json(trace);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch offer trace", error: error.message });
    }
  });

  // Get all offer traces with optional filters
  app.get("/api/offer/traces", async (req, res) => {
    try {
      const filters = req.query;
      const traces = await storage.getOfferTraces(filters);
      res.json(traces);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch offer traces", error: error.message });
    }
  });

  // Delete offer trace
  app.delete("/api/offer/traces/:id", async (req, res) => {
    try {
      await storage.deleteOfferTrace(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete offer trace", error: error.message });
    }
  });

  // Agent Routes

  // Get all agents with optional filters
  app.get("/api/agents", async (req, res) => {
    try {
      const filters = req.query;
      const agents = await storage.getAgents(filters);
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch agents", error: error.message });
    }
  });

  // Create single agent
  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkAgentConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Agent conflicts detected", 
          conflicts 
        });
      }

      const agent = await storage.insertAgent(validatedData);
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid agent data", error: error.message });
    }
  });

  // Get agent by ID
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgentById(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch agent", error: error.message });
    }
  });

  // Update agent
  app.put("/api/agents/:id", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.updateAgent(req.params.id, validatedData);
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update agent", error: error.message });
    }
  });

  // Update agent status
  app.patch("/api/agents/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const agent = await storage.updateAgentStatus(req.params.id, status);
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update agent status", error: error.message });
    }
  });

  // Delete agent
  app.delete("/api/agents/:id", async (req, res) => {
    try {
      await storage.deleteAgent(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete agent", error: error.message });
    }
  });

  // Channel Pricing Override Routes

  // Get all channel pricing overrides with optional filters
  app.get("/api/channel-overrides", async (req, res) => {
    try {
      const filters = req.query;
      const overrides = await storage.getChannelPricingOverrides(filters);
      res.json(overrides);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch channel overrides", error: error.message });
    }
  });

  // Create single channel pricing override
  app.post("/api/channel-overrides", async (req, res) => {
    try {
      const validatedData = insertChannelPricingOverrideSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkChannelPricingOverrideConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Channel override conflicts detected", 
          conflicts 
        });
      }

      const override = await storage.insertChannelPricingOverride(validatedData);
      res.status(201).json(override);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid channel override data", error: error.message });
    }
  });

  // Simulate channel override application
  app.post("/api/channel-overrides/simulate", async (req, res) => {
    try {
      const { basePrice, currency, overrideId } = req.body;

      if (!basePrice || !currency || !overrideId) {
        return res.status(400).json({ message: "basePrice, currency, and overrideId are required" });
      }

      const override = await storage.getChannelPricingOverrideById(overrideId);
      if (!override) {
        return res.status(404).json({ message: "Channel override not found" });
      }

      let adjustedPrice = parseFloat(basePrice);
      let adjustment = 0;

      if (override.adjustmentType === "PERCENT") {
        adjustment = basePrice * (parseFloat(override.adjustmentValue) / 100);
        adjustedPrice = basePrice + adjustment;
      } else if (override.adjustmentType === "AMOUNT") {
        adjustment = parseFloat(override.adjustmentValue);
        adjustedPrice = basePrice + adjustment;
      }

      res.json({
        basePrice: parseFloat(basePrice),
        adjustedPrice: Math.round(adjustedPrice * 100) / 100,
        adjustment: Math.round(adjustment * 100) / 100,
        adjustmentType: override.adjustmentType,
        adjustmentValue: parseFloat(override.adjustmentValue),
        currency,
        overrideApplied: override.overrideCode,
        channel: override.channel,
        productScope: override.productScope
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate channel override", error: error.message });
    }
  });

  // Get channel override by ID
  app.get("/api/channel-overrides/:id", async (req, res) => {
    try {
      const override = await storage.getChannelPricingOverrideById(req.params.id);
      if (!override) {
        return res.status(404).json({ message: "Channel override not found" });
      }
      res.json(override);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch channel override", error: error.message });
    }
  });

  // Update channel override
  app.put("/api/channel-overrides/:id", async (req, res) => {
    try {
      const validatedData = insertChannelPricingOverrideSchema.parse(req.body);
      const override = await storage.updateChannelPricingOverride(req.params.id, validatedData);
      res.json(override);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update channel override", error: error.message });
    }
  });

  // Update channel override status
  app.patch("/api/channel-overrides/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const override = await storage.updateChannelPricingOverrideStatus(req.params.id, status);
      res.json(override);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update channel override status", error: error.message });
    }
  });

  // Delete channel override
  app.delete("/api/channel-overrides/:id", async (req, res) => {
    try {
      await storage.deleteChannelPricingOverride(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete channel override", error: error.message });
    }
  });

  // Cohort Routes

  // Get all cohorts with optional filters
  app.get("/api/cohorts", async (req, res) => {
    try {
      const filters = req.query;
      const cohorts = await storage.getCohorts(filters);
      res.json(cohorts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch cohorts", error: error.message });
    }
  });

  // Create single cohort
  app.post("/api/cohorts", async (req, res) => {
    try {
      const validatedData = insertCohortSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkCohortConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Cohort conflicts detected", 
          conflicts 
        });
      }

      const cohort = await storage.insertCohort(validatedData);
      res.status(201).json(cohort);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid cohort data", error: error.message });
    }
  });

  // Get cohort by ID
  app.get("/api/cohorts/:id", async (req, res) => {
    try {
      const cohort = await storage.getCohortById(req.params.id);
      if (!cohort) {
        return res.status(404).json({ message: "Cohort not found" });
      }
      res.json(cohort);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch cohort", error: error.message });
    }
  });

  // Update cohort
  app.put("/api/cohorts/:id", async (req, res) => {
    try {
      const validatedData = insertCohortSchema.parse(req.body);
      const cohort = await storage.updateCohort(req.params.id, validatedData);
      res.json(cohort);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update cohort", error: error.message });
    }
  });

  // Update cohort status
  app.patch("/api/cohorts/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const cohort = await storage.updateCohortStatus(req.params.id, status);
      res.json(cohort);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update cohort status", error: error.message });
    }
  });

  // Delete cohort
  app.delete("/api/cohorts/:id", async (req, res) => {
    try {
      await storage.deleteCohort(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete cohort", error: error.message });
    }
  });

  // Simulate cohort assignment
  app.post("/api/cohorts/simulate", async (req, res) => {
    try {
      const { searchContext } = req.body;

      if (!searchContext) {
        return res.status(400).json({ message: "searchContext is required" });
      }

      // Get all active cohorts
      const activeCohorts = await storage.getCohorts({ status: "ACTIVE" });
      const matchedCohorts = [];

      // Simple cohort matching logic
      for (const cohort of activeCohorts) {
        const criteria = cohort.criteria as any;
        let matches = true;

        // Check POS criteria
        if (criteria.pos && searchContext.pos) {
          matches = matches && criteria.pos.includes(searchContext.pos);
        }

        // Check channel criteria
        if (criteria.channel && searchContext.channel) {
          matches = matches && criteria.channel === searchContext.channel;
        }

        // Check device criteria
        if (criteria.device && searchContext.device) {
          matches = matches && criteria.device === searchContext.device;
        }

        // Check booking window criteria
        if (criteria.bookingWindow && searchContext.bookingDaysAhead) {
          const bookingDays = searchContext.bookingDaysAhead;
          matches = matches && 
            bookingDays >= criteria.bookingWindow.min && 
            bookingDays <= criteria.bookingWindow.max;
        }

        if (matches) {
          matchedCohorts.push(cohort.cohortCode);
        }
      }

      res.json({
        searchContext,
        matchedCohorts,
        matchedCount: matchedCohorts.length
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to simulate cohort assignment", error: error.message });
    }
  });

  // Get cohorts for dropdowns
  app.get("/api/cohorts/list", async (req, res) => {
    try {
      console.log("Fetching cohorts for dropdown list...");
      let cohorts = await storage.getCohorts({ status: "ACTIVE" });
      console.log(`Found ${cohorts?.length || 0} active cohorts`);

      // If no cohorts exist, create some sample ones
      if (!cohorts || cohorts.length === 0) {
        console.log("No active cohorts found, creating sample cohorts...");

        const sampleCohorts = [
          {
            cohortCode: "FESTIVE_2025",
            cohortName: "Festive Season 2025",
            type: "SEASON",
            criteria: {
              season: "FESTIVE",
              pos: ["IN", "AE", "US"]
            },
            description: "Customers active during festive season",
            status: "ACTIVE",
            createdBy: "system"
          },
          {
            cohortCode: "PORTAL_USERS",
            cohortName: "Portal Active Users",
            type: "CHANNEL",
            criteria: {
              channel: "PORTAL",
              bookingFrequency: "HIGH"
            },
            description: "Frequent portal users",
            status: "ACTIVE",
            createdBy: "system"
          },
          {
            cohortCode: "HIGH_VALUE",
            cohortName: "High Value Customers",
            type: "BEHAVIOR",
            criteria: {
              behavior: {
                averageBookingValue: { min: 50000, max: 999999 },
                bookingFrequency: "HIGH"
              }
            },
            description: "High value frequent travelers",
            status: "ACTIVE",
            createdBy: "system"
          }
        ];

        try {
          for (const cohortData of sampleCohorts) {
            await storage.insertCohort(cohortData);
            console.log(`Created sample cohort: ${cohortData.cohortCode}`);
          }

          // Refetch after creating samples
          cohorts = await storage.getCohorts({ status: "ACTIVE" });
        } catch (createError) {
          console.error("Error creating sample cohorts:", createError);
        }
      }

      // Always return an array, even if empty
      if (!cohorts || cohorts.length === 0) {
        console.log("Still no cohorts found, returning empty array");
        return res.json([]);
      }

      const cohortList = cohorts.map(cohort => ({
        code: cohort.cohortCode,
        name: cohort.cohortName,
        id: cohort.id,
        type: cohort.type
      }));

      console.log("Returning cohorts:", cohortList);
      res.json(cohortList);
    } catch (error: any) {
      console.error("Error fetching cohorts list:", error);
      // Return empty array on error instead of 500 to prevent UI breaking
      res.json([]);
    }
  });

  // Audit Logs Routes

  // Get all audit logs with optional filters
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const filters = req.query;
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
    }
  });

  // Get audit log by ID
  app.get("/api/audit-logs/:id", async (req, res) => {
    try {
      const log = await storage.getAuditLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ message: "Audit log not found" });
      }
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch audit log", error: error.message });
    }
  });

  // Get audit logs by entity ID
  app.get("/api/audit-logs/entity/:entityId", async (req, res) => {
    try {
      const { module } = req.query;
      const logs = await storage.getAuditLogsByEntity(req.params.entityId, module as string);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch entity audit logs", error: error.message });
    }
  });

  // Create audit log entry
  app.post("/api/audit-logs", async (req, res) => {
    try {
      const auditData = {
        user: req.body.user || "system",
        module: req.body.module,
        entityId: req.body.entityId,
        action: req.body.action,
        beforeData: req.body.beforeData,
        afterData: req.body.afterData,
        justification: req.body.justification,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        sessionId: req.sessionID,
      };

      const log = await storage.createAuditLog(auditData);
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create audit log", error: error.message });
    }
  });

  // Export audit logs (CSV format)
  app.get("/api/audit-logs/export", async (req, res) => {
    try {
      const filters = req.query;
      const logs = await storage.getAuditLogs(filters);

      // Generate CSV content
      const headers = [
        "timestamp",
        "user",
        "module",
        "entityId",
        "action",
        "justification",
        "changes"
      ];

      const csvRows = [
        headers.join(","),
        ...logs.map(log => [
          log.timestamp?.toISOString() || "",
          log.user,
          log.module,
          log.entityId,
          log.action,
          `"${log.justification || ""}"`,
          `"${JSON.stringify(log.diff || {}).replace(/"/g, '""')}"`
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");
      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to export audit logs", error: error.message });
    }
  });

  // Delete audit log
  app.delete("/api/audit-logs/:id", async (req, res) => {
    try {
      await storage.deleteAuditLog(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete audit log", error: error.message });
    }
  });

  // Rollback entity to previous version
  app.post("/api/audit-logs/:id/rollback", async (req, res) => {
    try {
      const { justification } = req.body;
      const user = req.header("x-user") || "system";

      if (!justification) {
        return res.status(400).json({ message: "Justification is required for rollback operations" });
      }

      // Get the audit log entry
      const auditLog = await storage.getAuditLogById(req.params.id);
      if (!auditLog) {
        return res.status(404).json({ message: "Audit log not found" });
      }

      if (!auditLog.beforeData) {
        return res.status(400).json({ message: "No previous version available for rollback" });
      }

      // Perform rollback based on module type
      let result;
      switch (auditLog.module) {
        case "NegotiatedFare":
          result = await storage.withAuditLog(
            () => storage.updateNegotiatedFare(auditLog.entityId, auditLog.beforeData),
            {
              user,
              module: auditLog.module,
              entityId: auditLog.entityId,
              action: "ROLLBACK",
              justification: `Rollback to version from ${auditLog.timestamp}: ${justification}`,
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
              sessionId: req.sessionID || "unknown",
            },
            () => storage.getNegotiatedFareById(auditLog.entityId)
          );
          break;
        case "DynamicDiscountRule":
          result = await storage.withAuditLog(
            () => storage.updateDynamicDiscountRule(auditLog.entityId, auditLog.beforeData),
            {
              user,
              module: auditLog.module,
              entityId: auditLog.entityId,
              action: "ROLLBACK",
              justification: `Rollback to version from ${auditLog.timestamp}: ${justification}`,
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
              sessionId: req.sessionID || "unknown",
            },
            () => storage.getDynamicDiscountRuleById(auditLog.entityId)
          );
          break;
        default:
          return res.status(400).json({ message: `Rollback not supported for module: ${auditLog.module}` });
      }

      res.json({
        success: true,
        message: "Entity successfully rolled back",
        result
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to rollback entity", error: error.message });
    }
  });

  // Agent Tier Management Routes

  // Get all agent tiers with optional filters
  app.get("/api/tiers", async (req, res) => {
    try {
      const filters = req.query;
      const tiers = await storage.getAgentTiers(filters);
      res.json(tiers);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch agent tiers", error: error.message });
    }
  });

  // Create single agent tier
  app.post("/api/tiers", async (req, res) => {
    try {
      const validatedData = insertAgentTierSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkTierConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Tier conflicts detected", 
          conflicts 
        });
      }

      const tier = await storage.insertAgentTier(validatedData);
      res.status(201).json(tier);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid tier data", error: error.message });
    }
  });

  // Get tier by ID
  app.get("/api/tiers/:id", async (req, res) => {
    try {
      const tier = await storage.getAgentTierById(req.params.id);
      if (!tier) {
        return res.status(404).json({ message: "Tier not found" });
      }
      res.json(tier);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch tier", error: error.message });
    }
  });

  // Update tier
  app.put("/api/tiers/:id", async (req, res) => {
    try {
      const validatedData = insertAgentTierSchema.parse(req.body);
      const tier = await storage.updateAgentTier(req.params.id, validatedData);
      res.json(tier);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update tier", error: error.message });
    }
  });

  // Update tier status
  app.patch("/api/tiers/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const tier = await storage.updateAgentTierStatus(req.params.id, status);
      res.json(tier);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update tier status", error: error.message });
    }
  });

  // Delete tier
  app.delete("/api/tiers/:id", async (req, res) => {
    try {
      await storage.deleteAgentTier(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete tier", error: error.message });
    }
  });

  // Agent Tier Assignment Routes

  // Get all tier assignments with optional filters
  app.get("/api/tiers/assignments", async (req, res) => {
    try {
      const filters = req.query;
      console.log("Fetching tier assignments with filters:", filters);
      const assignments = await storage.getAgentTierAssignments(filters);
      console.log(`Found ${assignments?.length || 0} tier assignments`);
      res.json(assignments || []);
    } catch (error: any) {
      console.error("Error fetching tier assignments:", error);
      res.status(500).json({ message: "Failed to fetch tier assignments", error: error.message });
    }
  });

  // Assign tier to agent (manual override)
  app.post("/api/tiers/override", async (req, res) => {
    try {
      const { agentId, tierCode, effectiveFrom, justification, assignedBy } = req.body;

      if (!agentId || !tierCode || !effectiveFrom || !justification || !assignedBy) {
        return res.status(400).json({ 
          message: "agentId, tierCode, effectiveFrom, justification, and assignedBy are required" 
        });
      }

      // Supersede previous assignments
      await storage.supersedePreviousAssignments(agentId, effectiveFrom);

      // Create new manual assignment
      const assignmentData = {
        agentId,
        tierCode,
        assignmentType: "MANUAL_OVERRIDE" as const,
        effectiveFrom,
        justification,
        assignedBy,
        status: "ACTIVE" as const,
      };

      const assignment = await storage.insertAgentTierAssignment(assignmentData);

      // Create audit log
      const auditData = {
        user: assignedBy,
        module: "AgentTierAssignment",
        entityId: assignment.id,
        action: "MANUAL_OVERRIDE",
        afterData: assignment,
        justification,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        sessionId: req.sessionID || "unknown",
      };
      await storage.createAuditLog(auditData);

      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to override tier assignment", error: error.message });
    }
  });

  // Auto-assign tiers based on KPIs
  app.post("/api/tiers/assign", async (req, res) => {
    try {
      const { agentIds, effectiveFrom, assignedBy } = req.body;

      if (!agentIds || !Array.isArray(agentIds) || !effectiveFrom || !assignedBy) {
        return res.status(400).json({ 
          message: "agentIds (array), effectiveFrom, and assignedBy are required" 
        });
      }

      const assignments = [];
      const errors = [];

      for (const agentId of agentIds) {
        try {
          // Calculate KPIs for agent
          const kpiData = await storage.calculateAgentKPIs(agentId, 'QUARTERLY');

          // Evaluate tier based on KPIs
          const recommendedTier = await storage.evaluateAgentTier(agentId, kpiData);

          // Check if tier has changed
          const currentAssignment = await storage.getCurrentAgentTierAssignment(agentId);
          if (currentAssignment?.tierCode === recommendedTier) {
            continue; // No change needed
          }

          // Supersede previous assignments
          await storage.supersedePreviousAssignments(agentId, effectiveFrom);

          // Create new auto assignment
          const assignmentData = {
            agentId,
            tierCode: recommendedTier,
            assignmentType: "AUTO" as const,
            effectiveFrom,
            kpiData,
            assignedBy,
            justification: "Automatic tier assignment based on KPI evaluation",
            status: "ACTIVE" as const,
          };

          const assignment = await storage.insertAgentTierAssignment(assignmentData);
          assignments.push(assignment);

          // Create audit log
          const auditData = {
            user: assignedBy,
            module: "AgentTierAssignment",
            entityId: assignment.id,
            action: "AUTO_ASSIGNED",
            afterData: assignment,
            justification: "Automatic tier assignment based on KPI evaluation",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            sessionId: req.sessionID || "unknown",
          };
          await storage.createAuditLog(auditData);
        } catch (error: any) {
          errors.push({ agentId, error: error.message });
        }
      }

      res.json({
        success: true,
        processed: agentIds.length,
        assignments: assignments.length,
        errors: errors.length,
        data: {
          assignments,
          errors,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to assign tiers", error: error.message });
    }
  });

  // Get current tier for specific agent
  app.get("/api/agents/:agentId/tier", async (req, res) => {
    try {
      const assignment = await storage.getCurrentAgentTierAssignment(req.params.agentId);
      if (!assignment) {
        return res.status(404).json({ message: "No active tier assignment found" });
      }
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch agent tier", error: error.message });
    }
  });

  // Evaluate agent for tier (simulation)
  app.post("/api/tiers/evaluate", async (req, res) => {
    try {
      const { agentId, window } = req.body;

      if (!agentId || !window) {
        return res.status(400).json({ message: "agentId and window are required" });
      }

      // Calculate KPIs
      const kpiData = await storage.calculateAgentKPIs(agentId, window);

      // Evaluate tier
      const recommendedTier = await storage.evaluateAgentTier(agentId, kpiData);

      // Get current assignment
      const currentAssignment = await storage.getCurrentAgentTierAssignment(agentId);

      res.json({
        agentId,
        window,
        kpiData,
        recommendedTier,
        currentTier: currentAssignment?.tierCode || null,
        tierChangeRequired: currentAssignment?.tierCode !== recommendedTier,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to evaluate agent tier", error: error.message });
    }
  });

  // Tier Assignment Engine Routes

  // Get all assignment engines
  app.get("/api/tiers/engines", async (req, res) => {
    try {
      const filters = req.query;
      const engines = await storage.getTierAssignmentEngines(filters);
      res.json(engines);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch assignment engines", error: error.message });
    }
  });

  // Create assignment engine
  app.post("/api/tiers/engines", async (req, res) => {
    try {
      const validatedData = insertTierAssignmentEngineSchema.parse(req.body);
      const engine = await storage.insertTierAssignmentEngine(validatedData);
      res.status(201).json(engine);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid engine data", error: error.message });
    }
  });

  // Update assignment engine
  app.put("/api/tiers/engines/:id", async (req, res) => {
    try {
      const validatedData = insertTierAssignmentEngineSchema.parse(req.body);
      const engine = await storage.updateTierAssignmentEngine(req.params.id, validatedData);
      res.json(engine);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update engine", error: error.message });
    }
  });

  // Delete assignment engine
  app.delete("/api/tiers/engines/:id", async (req, res) => {
    try {
      await storage.deleteTierAssignmentEngine(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete engine", error: error.message });
    }
  });

  // Campaign Management Routes

  // Get all campaigns with optional filters
  app.get("/api/campaigns", async (req, res) => {
    try {
      const filters = req.query;
      const campaigns = await storage.getCampaigns(filters);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch campaigns", error: error.message });
    }
  });

  // Create single campaign
  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await storage.checkCampaignConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Campaign conflicts detected", 
          conflicts 
        });
      }

      const campaign = await storage.insertCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid campaign data", error: error.message });
    }
  });

  // Activate campaign
  app.post("/api/campaigns/:id/activate", async (req, res) => {
    try {
      const campaign = await storage.updateCampaignStatus(req.params.id, "ACTIVE");
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to activate campaign", error: error.message });
    }
  });

  // Deactivate campaign
  app.post("/api/campaigns/:id/deactivate", async (req, res) => {
    try {
      const campaign = await storage.updateCampaignStatus(req.params.id, "PAUSED");
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to deactivate campaign", error: error.message });
    }
  });

  // Get campaign by ID
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch campaign", error: error.message });
    }
  });

  // Update campaign
  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.updateCampaign(req.params.id, validatedData);
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update campaign", error: error.message });
    }
  });

  // Update campaign status
  app.patch("/api/campaigns/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const campaign = await storage.updateCampaignStatus(req.params.id, status);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update campaign status", error: error.message });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete campaign", error: error.message });
    }
  });

  // Campaign Metrics Routes

  // Get campaign metrics
  app.get("/api/campaigns/:campaignCode/metrics", async (req, res) => {
    try {
      const filters = req.query;
      const metrics = await storage.getCampaignMetrics(req.params.campaignCode, filters);

      // Calculate aggregated metrics
      const aggregated = metrics.reduce((acc, metric) => {
        acc.sent += metric.sent || 0;
        acc.delivered += metric.delivered || 0;
        acc.opened += metric.opened || 0;
        acc.clicked += metric.clicked || 0;
        acc.purchased += metric.purchased || 0;
        acc.revenueUplift += parseFloat(metric.revenueUplift || "0");
        return acc;
      }, {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        purchased: 0,
        revenueUplift: 0,
        attachRate: 0,
        roi: 0
      });

      // Calculate rates
      if (aggregated.sent > 0) {
        aggregated.attachRate = (aggregated.purchased / aggregated.sent) * 100;
      }
      if (aggregated.revenueUplift > 0) {
        // Simplified ROI calculation - would need campaign cost data in real implementation
        aggregated.roi = aggregated.revenueUplift / 1000; // Assuming $1000 campaign cost
      }

      res.json({
        aggregated,
        daily: metrics
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch campaign metrics", error: error.message });
    }
  });

  // Record campaign metrics
  app.post("/api/campaigns/:campaignCode/metrics", async (req, res) => {
    try {
      const validatedData = insertCampaignMetricsSchema.parse({
        ...req.body,
        campaignCode: req.params.campaignCode
      });

      const metrics = await storage.insertCampaignMetrics(validatedData);
      res.status(201).json(metrics);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid metrics data", error: error.message });
    }
  });

  // Campaign Delivery Routes

  // Get campaign deliveries
  app.get("/api/campaigns/:campaignCode/deliveries", async (req, res) => {
    try {
      const filters = req.query;
      const deliveries = await storage.getCampaignDeliveries(req.params.campaignCode, filters);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch campaign deliveries", error: error.message });
    }
  });

  // Record campaign delivery
  app.post("/api/campaigns/:campaignCode/deliveries", async (req, res) => {
    try {
      const validatedData = insertCampaignDeliverySchema.parse({
        ...req.body,
        campaignCode: req.params.campaignCode
      });

      const delivery = await storage.insertCampaignDelivery(validatedData);
      res.status(201).json(delivery);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid delivery data", error: error.message });
    }
  });

  // Update delivery status
  app.patch("/api/campaigns/deliveries/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["PENDING", "SENT", "DELIVERED", "FAILED"].includes(status)) {
        return res.status(400).json({ message: "Invalid delivery status" });
      }

      const delivery = await storage.updateDeliveryStatus(req.params.id, status);
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update delivery status", error: error.message });
    }
  });

  // Record delivery event (opened, clicked, purchased)
  app.post("/api/campaigns/deliveries/:id/events", async (req, res) => {
    try {
      const { event, data } = req.body;
      if (!event || !["OPENED", "CLICKED", "PURCHASED"].includes(event)) {
        return res.status(400).json({ message: "Invalid event type" });
      }

      await storage.recordDeliveryEvent(req.params.id, event, data);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to record delivery event", error: error.message });
    }
  });

  // Analytics & Simulation Routes

  // Simulation Routes
  app.get("/api/simulations", async (req, res) => {
    try {
      const filters = req.query;
      const simulations = await storage.getSimulations(filters);
      res.json(simulations);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch simulations", error: error.message });
    }
  });

  app.post("/api/simulations", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      const user = req.header("x-user") || "system";

      const simulation = await storage.insertSimulation({
        ...validatedData,
        createdBy: user
      });

      res.status(201).json(simulation);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid simulation data", error: error.message });
    }
  });

  app.get("/api/simulations/:id", async (req, res) => {
    try {
      const simulation = await storage.getSimulationById(req.params.id);
      if (!simulation) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      res.json(simulation);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch simulation", error: error.message });
    }
  });

  app.put("/api/simulations/:id", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.updateSimulation(req.params.id, validatedData);
      res.json(simulation);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update simulation", error: error.message });
    }
  });

  app.post("/api/simulations/:id/run", async (req, res) => {
    try {
      const result = await storage.runSimulation(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to run simulation", error: error.message });
    }
  });

  app.patch("/api/simulations/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["DRAFT", "RUNNING", "COMPLETED", "CANCELLED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const simulation = await storage.updateSimulationStatus(req.params.id, status);
      res.json(simulation);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update simulation status", error: error.message });
    }
  });

  app.delete("/api/simulations/:id", async (req, res) => {
    try {
      await storage.deleteSimulation(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete simulation", error: error.message });
    }
  });

  // Insight Query Routes
  app.get("/api/insights/queries", async (req, res) => {
    try {
      const filters = req.query;
      const queries = await storage.getInsightQueries(filters);
      res.json(queries);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch insight queries", error: error.message });
    }
  });

  app.post("/api/insights/query", async (req, res) => {
    try {
      const { queryText, filters } = req.body;
      const user = req.header("x-user") || "system";

      if (!queryText) {
        return res.status(400).json({ message: "Query text is required" });
      }

      // Create query record
      const query = await storage.insertInsightQuery({
        queryText,
        filters,
        createdBy: user
      });

      // Process query asynchronously
      try {
        const result = await storage.processInsightQuery(query.id);
        res.json(result);
      } catch (processingError: any) {
        res.status(500).json({ 
          message: "Query processing failed", 
          error: processingError.message,
          queryId: query.id 
        });
      }
    } catch (error: any) {
      res.status(400).json({ message: "Invalid query data", error: error.message });
    }
  });

  app.get("/api/insights/queries/:id", async (req, res) => {
    try {
      const query = await storage.getInsightQueryById(req.params.id);
      if (!query) {
        return res.status(404).json({ message: "Query not found" });
      }
      res.json(query);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch query", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}