import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all students with filters
export const getStudents = query({
  args: {
    department: v.optional(v.string()),
    semester: v.optional(v.number()),
    riskLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    let students;

    if (args.department) {
      students = await ctx.db
        .query("students")
        .withIndex("by_department", (q) => q.eq("department", args.department!))
        .collect();
    } else if (args.semester) {
      students = await ctx.db
        .query("students")
        .withIndex("by_semester", (q) => q.eq("semester", args.semester!))
        .collect();
    } else {
      students = await ctx.db.query("students").collect();
    }

    if (args.riskLevel) {
      students = students.filter(s => s.riskLevel === args.riskLevel);
    }

    return students;
  },
});

// Get student by ID
export const getStudent = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("students")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .unique();
  },
});

// Get high-risk students (risk score > 0.7)
export const getHighRiskStudents = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const students = await ctx.db.query("students").collect();
    return students.filter(s => s.riskScore && s.riskScore > 0.7);
  },
});

// Create or update student
export const upsertStudent = mutation({
  args: {
    studentId: v.string(),
    name: v.string(),
    email: v.string(),
    department: v.string(),
    semester: v.number(),
    enrollmentDate: v.number(),
    attendancePercentage: v.number(),
    gpa: v.number(),
    gpaTrend: v.string(),
    feeStatus: v.string(),
    feeDueDays: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db
      .query("students")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        lastUpdated: Date.now(),
      });
    } else {
      return await ctx.db.insert("students", {
        ...args,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Update risk score for student
export const updateRiskScore = mutation({
  args: {
    studentId: v.string(),
    riskScore: v.number(),
  },
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

    let riskLevel: "low" | "medium" | "high";
    if (args.riskScore < 0.3) {
      riskLevel = "low";
    } else if (args.riskScore < 0.7) {
      riskLevel = "medium";
    } else {
      riskLevel = "high";
    }

    return await ctx.db.patch(student._id, {
      riskScore: args.riskScore,
      riskLevel,
      lastUpdated: Date.now(),
    });
  },
});

// Get risk distribution for dashboard
export const getRiskDistribution = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const students = await ctx.db.query("students").collect();
    
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
    };

    students.forEach(student => {
      if (student.riskLevel) {
        distribution[student.riskLevel]++;
      }
    });

    return distribution;
  },
});