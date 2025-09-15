import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";

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

// Action: Seeds sample data then computes risk scores for all, returning a summary
export const seedAndCompute = internalAction({
  args: {},
  handler: async (ctx) => {
    const seeded = await ctx.runMutation(internal.dev.generateSampleDataInternal, {});
    const results = await ctx.runMutation(api.predictions.calculateAllRiskScores, {});

    const summary = { low: 0, medium: 0, high: 0 } as Record<"low" | "medium" | "high", number>;
    for (const r of results as Array<{ riskLevel: "low" | "medium" | "high" }>) {
      if (r.riskLevel) summary[r.riskLevel]++;
    }

    return {
      seededCount: seeded.count,
      processed: results.length,
      distribution: summary,
    };
  },
});
