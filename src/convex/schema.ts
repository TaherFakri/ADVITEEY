import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  MENTOR: "mentor",
  USER: "user",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.MENTOR),
  v.literal(ROLES.USER),
);
export type Role = Infer<typeof roleValidator>;

// Risk levels for dropout prediction
export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
} as const;

export const riskLevelValidator = v.union(
  v.literal(RISK_LEVELS.LOW),
  v.literal(RISK_LEVELS.MEDIUM),
  v.literal(RISK_LEVELS.HIGH),
);
export type RiskLevel = Infer<typeof riskLevelValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      department: v.optional(v.string()), // department for mentors
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Students table for tracking academic data
    students: defineTable({
      studentId: v.string(), // unique student identifier
      name: v.string(),
      email: v.string(),
      department: v.string(),
      semester: v.number(),
      enrollmentDate: v.number(),
      attendancePercentage: v.number(),
      gpa: v.number(),
      gpaTrend: v.string(), // "increasing", "decreasing", "stable"
      feeStatus: v.string(), // "paid", "pending", "overdue"
      feeDueDays: v.number(),
      riskScore: v.optional(v.number()), // 0-1 dropout risk score
      riskLevel: v.optional(riskLevelValidator),
      lastUpdated: v.number(),
    })
      .index("by_student_id", ["studentId"])
      .index("by_department", ["department"])
      .index("by_semester", ["semester"])
      .index("by_risk_level", ["riskLevel"])
      .index("by_department_and_semester", ["department", "semester"]),

    // Assessment scores for ML model training
    assessments: defineTable({
      studentId: v.string(),
      assessmentType: v.string(), // "quiz", "midterm", "final", "assignment"
      score: v.number(),
      maxScore: v.number(),
      date: v.number(),
      subject: v.string(),
    })
      .index("by_student_id", ["studentId"])
      .index("by_student_and_date", ["studentId", "date"]),

    // Attendance records
    attendance: defineTable({
      studentId: v.string(),
      date: v.number(),
      status: v.string(), // "present", "absent", "late"
      subject: v.string(),
    })
      .index("by_student_id", ["studentId"])
      .index("by_student_and_date", ["studentId", "date"]),

    // Fee payment history
    feePayments: defineTable({
      studentId: v.string(),
      amount: v.number(),
      dueDate: v.number(),
      paidDate: v.optional(v.number()),
      status: v.string(), // "paid", "pending", "overdue"
      semester: v.number(),
    })
      .index("by_student_id", ["studentId"])
      .index("by_status", ["status"]),

    // Counseling sessions and mentor notes
    counselingSessions: defineTable({
      studentId: v.string(),
      mentorId: v.string(), // user ID of the mentor
      sessionDate: v.number(),
      notes: v.string(),
      actionItems: v.array(v.string()),
      followUpDate: v.optional(v.number()),
      sessionType: v.string(), // "intervention", "regular", "emergency"
      outcome: v.optional(v.string()),
    })
      .index("by_student_id", ["studentId"])
      .index("by_mentor_id", ["mentorId"])
      .index("by_student_and_date", ["studentId", "sessionDate"]),

    // Alert notifications for high-risk students
    alerts: defineTable({
      studentId: v.string(),
      riskScore: v.number(),
      alertType: v.string(), // "high_risk", "attendance_drop", "grade_drop", "fee_overdue"
      message: v.string(),
      isRead: v.boolean(),
      assignedMentorId: v.optional(v.string()),
      createdAt: v.number(),
      resolvedAt: v.optional(v.number()),
    })
      .index("by_student_id", ["studentId"])
      .index("by_mentor_id", ["assignedMentorId"])
      .index("by_is_read", ["isRead"])
      .index("by_alert_type", ["alertType"]),

    // ML model predictions and training data
    predictions: defineTable({
      studentId: v.string(),
      riskScore: v.number(),
      features: v.object({
        attendancePercentage: v.number(),
        gpa: v.number(),
        feeDueDays: v.number(),
        assessmentAverage: v.number(),
        gpaTrend: v.number(), // encoded as number for ML
      }),
      modelVersion: v.string(),
      predictionDate: v.number(),
    })
      .index("by_student_id", ["studentId"])
      .index("by_prediction_date", ["predictionDate"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;