import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { insertNegotiatedFareSchema } from "../shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
