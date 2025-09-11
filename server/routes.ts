import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { insertNegotiatedFareSchema, insertDynamicDiscountRuleSchema, insertAirAncillaryRuleSchema } from "../shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
