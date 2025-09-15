import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get counseling sessions for a student
export const getStudentCounselingSessions = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("counselingSessions")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

// Get counseling sessions for a mentor
export const getMentorCounselingSessions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("counselingSessions")
      .withIndex("by_mentor_id", (q) => q.eq("mentorId", user._id))
      .collect();
  },
});

// Create new counseling session
export const createCounselingSession = mutation({
  args: {
    studentId: v.string(),
    notes: v.string(),
    actionItems: v.array(v.string()),
    followUpDate: v.optional(v.number()),
    sessionType: v.string(),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "mentor" && user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("counselingSessions", {
      ...args,
      mentorId: user._id,
      sessionDate: Date.now(),
    });
  },
});

// Update counseling session
export const updateCounselingSession = mutation({
  args: {
    sessionId: v.id("counselingSessions"),
    notes: v.optional(v.string()),
    actionItems: v.optional(v.array(v.string())),
    followUpDate: v.optional(v.number()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.mentorId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { sessionId, ...updates } = args;
    return await ctx.db.patch(sessionId, updates);
  },
});
