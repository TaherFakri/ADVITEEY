import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all alerts
export const getAlerts = query({
  args: {
    isRead: v.optional(v.boolean()),
    alertType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    let alerts;

    if (args.isRead !== undefined) {
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_is_read", (q) => q.eq("isRead", args.isRead!))
        .collect();
    } else {
      alerts = await ctx.db.query("alerts").collect();
    }

    if (args.alertType) {
      alerts = alerts.filter(a => a.alertType === args.alertType);
    }

    // If user is a mentor, only show alerts assigned to them
    if (user.role === "mentor") {
      alerts = alerts.filter(a => a.assignedMentorId === user._id);
    }

    return alerts;
  },
});

// Create alert for high-risk student
export const createAlert = mutation({
  args: {
    studentId: v.string(),
    riskScore: v.number(),
    alertType: v.string(),
    message: v.string(),
    assignedMentorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("alerts", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Mark alert as read
export const markAlertAsRead = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.alertId, {
      isRead: true,
    });
  },
});

// Resolve alert
export const resolveAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.alertId, {
      isRead: true,
      resolvedAt: Date.now(),
    });
  },
});