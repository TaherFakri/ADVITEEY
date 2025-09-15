import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

// Internal mutation: seeds sample students without auth checks (for development/testing)
export const generateSampleDataInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"];
    const names = [
      "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown",
      "Frank Miller", "Grace Lee", "Henry Taylor", "Ivy Chen", "Jack Anderson",
      "Kate Thompson", "Liam Garcia", "Maya Patel", "Noah Rodriguez", "Olivia Martinez",
      "Paul Jackson", "Quinn White", "Ruby Harris", "Sam Clark", "Tina Lewis"
    ];

    let count = 0;

    for (let i = 0; i < 20; i++) {
      const studentId = `STU${String(i + 1).padStart(3, "0")}`;
      const name = names[i];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const semester = Math.floor(Math.random() * 8) + 1;
      const attendancePercentage = Math.random() * 40 + 60; // 60-100%
      const gpa = Math.random() * 2 + 2; // 2.0-4.0
      const gpaTrends = ["increasing", "decreasing", "stable"] as const;
      const gpaTrend = gpaTrends[Math.floor(Math.random() * gpaTrends.length)];
      const feeStatuses = ["paid", "pending", "overdue"] as const;
      const feeStatus = feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
      const feeDueDays = feeStatus === "overdue" ? Math.floor(Math.random() * 60) + 1 : 0;

      await ctx.db.insert("students", {
        studentId,
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@university.edu`,
        department,
        semester,
        enrollmentDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 4,
        attendancePercentage,
        gpa,
        gpaTrend,
        feeStatus,
        feeDueDays,
        lastUpdated: Date.now(),
      });
      count++;
    }

    return { message: "Sample data generated (internal)", count };
  },
});

// Add: internal mutation to compute all risk scores without auth
export const calculateAllRiskScoresInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    const results: Array<{ studentId: string; riskScore: number; riskLevel: "low" | "medium" | "high" }> = [];

    for (const student of students) {
      let riskScore = 0;

      const attendanceRisk = Math.max(0, (80 - student.attendancePercentage) / 80);
      riskScore += attendanceRisk * 0.4;

      const gpaRisk = Math.max(0, (3.0 - student.gpa) / 3.0);
      riskScore += gpaRisk * 0.3;

      const feeRisk = student.feeStatus === "overdue" ? 1 : student.feeStatus === "pending" ? 0.5 : 0;
      riskScore += feeRisk * 0.2;

      const trendRisk = student.gpaTrend === "decreasing" ? 1 : student.gpaTrend === "stable" ? 0.3 : 0;
      riskScore += trendRisk * 0.1;

      riskScore = Math.min(1, Math.max(0, riskScore));

      let riskLevel: "low" | "medium" | "high";
      if (riskScore < 0.3) riskLevel = "low";
      else if (riskScore < 0.7) riskLevel = "medium";
      else riskLevel = "high";

      await ctx.db.patch(student._id, {
        riskScore,
        riskLevel,
        lastUpdated: Date.now(),
      });

      await ctx.db.insert("predictions", {
        studentId: student.studentId,
        riskScore,
        features: {
          attendancePercentage: student.attendancePercentage,
          gpa: student.gpa,
          feeDueDays: student.feeDueDays,
          assessmentAverage: student.gpa * 25,
          gpaTrend: student.gpaTrend === "increasing" ? 1 : student.gpaTrend === "stable" ? 0 : -1,
        },
        modelVersion: "v1.0",
        predictionDate: Date.now(),
      });

      if (riskScore > 0.7) {
        await ctx.db.insert("alerts", {
          studentId: student.studentId,
          riskScore,
          alertType: "high_risk",
          message: `Student ${student.name} has been flagged as high risk (${Math.round(riskScore * 100)}% dropout probability)`,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      results.push({ studentId: student.studentId, riskScore, riskLevel });
    }

    return results;
  },
});

// Add: promote all existing users to admin (bypass auth)
export const promoteAllUsersToAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    for await (const u of ctx.db.query("users")) {
      await ctx.db.patch(u._id, { role: "admin" });
    }
    return { message: "All users promoted to admin" };
  },
});

// Add: ensure or create an admin user by email
export const ensureAdminUser = internalMutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { role: "admin", name: args.name ?? existing.name });
      return { _id: existing._id, updated: true };
    }
    const _id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name ?? "Admin User",
      role: "admin",
      isAnonymous: false,
    });
    return { _id, created: true };
  },
});

// Action: Seeds sample data then computes risk scores for all, returning a summary
export const seedAndCompute = internalAction({
  args: {},
  handler: async (ctx) => {
    const seeded: { message: string; count: number } = await ctx.runMutation(internal.dev.generateSampleDataInternal, {});
    const results: Array<{ studentId: string; riskScore: number; riskLevel: "low" | "medium" | "high" }> =
      await ctx.runMutation(internal.dev.calculateAllRiskScoresInternal, {});

    const summary: Record<"low" | "medium" | "high", number> = { low: 0, medium: 0, high: 0 };
    for (const r of results) summary[r.riskLevel]++;

    return {
      seededCount: seeded.count,
      processed: results.length,
      distribution: summary,
    };
  },
});