import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Simple ML prediction function (mock implementation)
export const calculateRiskScore = mutation({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const student = await ctx.db
      .query("students")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .unique();

    if (!student) {
      throw new Error("Student not found");
    }

    // Simple risk calculation based on multiple factors
    let riskScore = 0;

    // Attendance factor (40% weight)
    const attendanceRisk = Math.max(0, (80 - student.attendancePercentage) / 80);
    riskScore += attendanceRisk * 0.4;

    // GPA factor (30% weight)
    const gpaRisk = Math.max(0, (3.0 - student.gpa) / 3.0);
    riskScore += gpaRisk * 0.3;

    // Fee status factor (20% weight)
    const feeRisk = student.feeStatus === "overdue" ? 1 : 
                   student.feeStatus === "pending" ? 0.5 : 0;
    riskScore += feeRisk * 0.2;

    // GPA trend factor (10% weight)
    const trendRisk = student.gpaTrend === "decreasing" ? 1 : 
                     student.gpaTrend === "stable" ? 0.3 : 0;
    riskScore += trendRisk * 0.1;

    // Ensure score is between 0 and 1
    riskScore = Math.min(1, Math.max(0, riskScore));

    // Update student record
    let riskLevel: "low" | "medium" | "high";
    if (riskScore < 0.3) {
      riskLevel = "low";
    } else if (riskScore < 0.7) {
      riskLevel = "medium";
    } else {
      riskLevel = "high";
    }

    await ctx.db.patch(student._id, {
      riskScore,
      riskLevel,
      lastUpdated: Date.now(),
    });

    // Store prediction
    await ctx.db.insert("predictions", {
      studentId: args.studentId,
      riskScore,
      features: {
        attendancePercentage: student.attendancePercentage,
        gpa: student.gpa,
        feeDueDays: student.feeDueDays,
        assessmentAverage: student.gpa * 25, // Mock assessment average
        gpaTrend: student.gpaTrend === "increasing" ? 1 : 
                 student.gpaTrend === "stable" ? 0 : -1,
      },
      modelVersion: "v1.0",
      predictionDate: Date.now(),
    });

    // Create alert if high risk
    if (riskScore > 0.7) {
      await ctx.db.insert("alerts", {
        studentId: args.studentId,
        riskScore,
        alertType: "high_risk",
        message: `Student ${student.name} has been flagged as high risk (${Math.round(riskScore * 100)}% dropout probability)`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { riskScore, riskLevel };
  },
});

// Calculate risk scores for all students
export const calculateAllRiskScores = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const students = await ctx.db.query("students").collect();
    const results = [];

    for (const student of students) {
      // Simple risk calculation based on multiple factors
      let riskScore = 0;

      // Attendance factor (40% weight)
      const attendanceRisk = Math.max(0, (80 - student.attendancePercentage) / 80);
      riskScore += attendanceRisk * 0.4;

      // GPA factor (30% weight)
      const gpaRisk = Math.max(0, (3.0 - student.gpa) / 3.0);
      riskScore += gpaRisk * 0.3;

      // Fee status factor (20% weight)
      const feeRisk = student.feeStatus === "overdue" ? 1 : 
                     student.feeStatus === "pending" ? 0.5 : 0;
      riskScore += feeRisk * 0.2;

      // GPA trend factor (10% weight)
      const trendRisk = student.gpaTrend === "decreasing" ? 1 : 
                       student.gpaTrend === "stable" ? 0.3 : 0;
      riskScore += trendRisk * 0.1;

      // Ensure score is between 0 and 1
      riskScore = Math.min(1, Math.max(0, riskScore));

      // Update student record
      let riskLevel: "low" | "medium" | "high";
      if (riskScore < 0.3) {
        riskLevel = "low";
      } else if (riskScore < 0.7) {
        riskLevel = "medium";
      } else {
        riskLevel = "high";
      }

      await ctx.db.patch(student._id, {
        riskScore,
        riskLevel,
        lastUpdated: Date.now(),
      });

      // Store prediction
      await ctx.db.insert("predictions", {
        studentId: student.studentId,
        riskScore,
        features: {
          attendancePercentage: student.attendancePercentage,
          gpa: student.gpa,
          feeDueDays: student.feeDueDays,
          assessmentAverage: student.gpa * 25, // Mock assessment average
          gpaTrend: student.gpaTrend === "increasing" ? 1 : 
                   student.gpaTrend === "stable" ? 0 : -1,
        },
        modelVersion: "v1.0",
        predictionDate: Date.now(),
      });

      // Create alert if high risk
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
