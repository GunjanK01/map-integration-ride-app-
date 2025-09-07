import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRide = mutation({
  args: {
    userId: v.string(),
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
    fare: v.number(),
    distance: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const rideId = await ctx.db.insert("rides", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return rideId;
  },
});

export const acceptRide = mutation({
  args: {
    rideId: v.id("rides"),
    riderId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rideId, {
      riderId: args.riderId,
      status: "accepted",
    });
  },
});

export const updateRiderLocation = mutation({
  args: {
    rideId: v.id("rides"),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rideId, {
      riderLocation: args.location,
    });
  },
});

export const updateRideStatus = mutation({
  args: {
    rideId: v.id("rides"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rideId, {
      status: args.status,
    });
  },
});

export const getPendingRides = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rides")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  },
});

export const getRideById = query({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.rideId);
  },
});

export const getUserRides = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rides")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getRiderRides = query({
  args: { riderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rides")
      .filter((q) => q.eq(q.field("riderId"), args.riderId))
      .order("desc")
      .collect();
  },
});