import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rides: defineTable({
    userId: v.string(),
    riderId: v.optional(v.string()),
    pickup: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    }),
    destination: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    fare: v.number(),
    distance: v.number(),
    duration: v.number(),
    createdAt: v.number(),
    riderLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
  }),
  
  users: defineTable({
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("rider")),
    currentLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    isOnline: v.boolean(),
  }),
});