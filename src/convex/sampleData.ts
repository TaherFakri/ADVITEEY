import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Generate sample data for testing
export const generateSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"];
    const names = [
      "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown",
      "Frank Miller", "Grace Lee", "Henry Taylor", "Ivy Chen", "Jack Anderson",
      "Kate Thompson", "Liam Garcia", "Maya Patel", "Noah Rodriguez", "Olivia Martinez",
      "Paul Jackson", "Quinn White", "Ruby Harris", "Sam Clark", "Tina Lewis"
    ];

    const students = [];
    
    for (let i = 0; i < 20; i++) {
      const studentId = `STU${String(i + 1).padStart(3, '0')}`;
      const name = names[i];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const semester = Math.floor(Math.random() * 8) + 1;
      const attendancePercentage = Math.random() * 40 + 60; // 60-100%
      const gpa = Math.random() * 2 + 2; // 2.0-4.0
      const gpaTrends = ["increasing", "decreasing", "stable"];
      const gpaTrend = gpaTrends[Math.floor(Math.random() * gpaTrends.length)];
      const feeStatuses = ["paid", "pending", "overdue"];
      const feeStatus = feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
      const feeDueDays = feeStatus === "overdue" ? Math.floor(Math.random() * 60) + 1 : 0;

      const student = {
        studentId,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@university.edu`,
        department,
        semester,
        enrollmentDate: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000 * 4), // Random date within last 4 years
        attendancePercentage,
        gpa,
        gpaTrend,
        feeStatus,
        feeDueDays,
        lastUpdated: Date.now(),
      };

      students.push(student);
      await ctx.db.insert("students", student);
    }

    return { message: "Sample data generated successfully", count: students.length };
  },
});

export const generateGuestSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Any authenticated user can call; ensure user exists
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Only seed if there are no students to avoid duplicates/spam
    const existingAny = await ctx.db.query("students").take(1);
    if (existingAny.length > 0) {
      return { message: "Sample data already exists. Skipping.", count: 0 };
    }

    const departments = ["Computer Science", "Mathematics", "Physics"];
    const names = [
      "Guest Alice", "Guest Bob", "Guest Carol", "Guest David", "Guest Eva",
      "Guest Frank", "Guest Grace", "Guest Henry", "Guest Ivy", "Guest Jack"
    ];

    let count = 0;
    for (let i = 0; i < names.length; i++) {
      const studentId = `GST${String(i + 1).padStart(3, "0")}`;
      const name = names[i];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const semester = Math.floor(Math.random() * 8) + 1;
      const attendancePercentage = Math.random() * 40 + 60;
      const gpa = Math.random() * 2 + 2;
      const gpaTrends = ["increasing", "decreasing", "stable"] as const;
      const gpaTrend = gpaTrends[Math.floor(Math.random() * gpaTrends.length)];
      const feeStatuses = ["paid", "pending", "overdue"] as const;
      const feeStatus = feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
      const feeDueDays = feeStatus === "overdue" ? Math.floor(Math.random() * 60) + 1 : 0;

      await ctx.db.insert("students", {
        studentId,
        name,
        email: `${name.toLowerCase().replace(/\\s+/g, ".")}@guest.edu`,
        department,
        semester,
        enrollmentDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2,
        attendancePercentage,
        gpa,
        gpaTrend,
        feeStatus,
        feeDueDays,
        lastUpdated: Date.now(),
      });
      count++;
    }

    return { message: "Guest sample data generated", count };
  },
});