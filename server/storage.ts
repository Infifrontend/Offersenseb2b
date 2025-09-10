
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, negotiatedFares, type User, type NegotiatedFare, type InsertNegotiatedFare } from "../shared/schema";
import { eq, and, or, sql } from "drizzle-orm";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);

export const storage = {
  async insertUser(user: any): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  },

  async insertNegotiatedFare(fare: InsertNegotiatedFare): Promise<NegotiatedFare> {
    const [newFare] = await db.insert(negotiatedFares).values(fare).returning();
    return newFare;
  },

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
  },

  async getNegotiatedFareById(id: string): Promise<NegotiatedFare | null> {
    const [fare] = await db.select().from(negotiatedFares).where(eq(negotiatedFares.id, id));
    return fare || null;
  },

  async updateNegotiatedFare(id: string, updates: Partial<InsertNegotiatedFare>): Promise<NegotiatedFare> {
    const [updatedFare] = await db
      .update(negotiatedFares)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(negotiatedFares.id, id))
      .returning();
    return updatedFare;
  },

  async deleteNegotiatedFare(id: string): Promise<void> {
    await db.delete(negotiatedFares).where(eq(negotiatedFares.id, id));
  },

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
  },
};
