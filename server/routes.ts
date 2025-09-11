import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { insertNegotiatedFareSchema, insertDynamicDiscountRuleSchema, insertAirAncillaryRuleSchema, insertNonAirRateSchema, insertNonAirMarkupRuleSchema, insertBundleSchema, insertBundlePricingRuleSchema, insertOfferRuleSchema } from "../shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Check for conflicts
      const conflicts = await storage.checkFareConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Fare conflicts detected", 
          conflicts 
        });
      }

      const fare = await storage.insertNegotiatedFare(validatedData);
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
      const fare = await storage.updateNegotiatedFare(req.params.id, validatedData);
      res.json(fare);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update fare", error: error.message });
    }
  });

  // Update fare status
  app.patch("/api/negofares/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }
      
      const fare = await storage.updateNegotiatedFareStatus(req.params.id, status);
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
      const validatedData = insertDynamicDiscountRuleSchema.parse(req.body);
      
      // Check for conflicts
      const conflicts = await storage.checkDiscountRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertDynamicDiscountRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
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

  // Bundle Routes
  
  // Get all bundles with optional filters
  app.get("/api/bundles", async (req, res) => {
    try {
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

  // Bundle Pricing Rules Routes
  
  // Get all bundle pricing rules with optional filters
  app.get("/api/bundles/pricing", async (req, res) => {
    try {
      const filters = req.query;
      const rules = await storage.getBundlePricingRules(filters);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bundle pricing rules", error: error.message });
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
      const validatedData = insertOfferRuleSchema.parse(req.body);
      
      // Check for conflicts
      const conflicts = await storage.checkOfferRuleConflicts(validatedData);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Rule conflicts detected", 
          conflicts 
        });
      }

      const rule = await storage.insertOfferRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
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

  const httpServer = createServer(app);
  return httpServer;
}
