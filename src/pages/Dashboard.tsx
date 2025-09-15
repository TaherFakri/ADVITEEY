import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Users, TrendingUp, Bell, BookOpen, GraduationCap, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useRef } from "react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    riskLevel: "",
  });
  const autoSeededRef = useRef(false);

  const students = useQuery(api.students.getStudents, {
  department: filters.department || undefined,
  semester: filters.semester ? Number(filters.semester) : undefined,
  riskLevel: filters.riskLevel || undefined,
});
  const riskDistribution = useQuery(api.students.getRiskDistribution);
  const alerts = useQuery(api.alerts.getAlerts, { isRead: false });
  const generateSampleData = useMutation(api.sampleData.generateSampleData);
  const generateGuestSampleData = useMutation(api.sampleData.generateGuestSampleData);
  const calculateAllRiskScores = useMutation(api.predictions.calculateAllRiskScores);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Auto-load guest sample data if no students exist
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      students &&
      students.length === 0 &&
      !autoSeededRef.current
    ) {
      autoSeededRef.current = true;
      generateGuestSampleData()
        .then(() => {
          toast.success("Loaded guest sample data automatically");
        })
        .catch(() => {
          autoSeededRef.current = false;
          toast.error("Failed to auto-load guest sample data");
        });
    }
  }, [isLoading, isAuthenticated, students, generateGuestSampleData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleGenerateSampleData = async () => {
    try {
      await generateSampleData();
      toast.success("Sample data generated successfully!");
    } catch (error) {
      toast.error("Failed to generate sample data");
    }
  };

  const handleGenerateGuestSample = async () => {
    try {
      await generateGuestSampleData();
      toast.success("Guest sample data loaded!");
    } catch (e) {
      toast.error("Failed to load guest sample data");
    }
  };

  const handleCalculateRiskScores = async () => {
    try {
      await calculateAllRiskScores();
      toast.success("Risk scores calculated for all students!");
    } catch (error) {
      toast.error("Failed to calculate risk scores");
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">
              AI Dropout Risk Dashboard
            </h1>
            <p className="text-white/80">
              Monitor student performance and predict dropout risks
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {students?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    High Risk
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    {riskDistribution?.high || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Active Alerts
                  </CardTitle>
                  <Bell className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">
                    {alerts?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    Avg. Attendance
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {students?.length ? 
                      Math.round(students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length) 
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Admin Controls */}
          {user.role === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader>
                  <CardTitle className="text-white">Admin Controls</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button 
                    onClick={handleGenerateSampleData}
                    className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Sample Data
                  </Button>
                  <Button 
                    onClick={handleCalculateRiskScores}
                    className="bg-accent/20 hover:bg-accent/30 text-white border border-accent/30"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Calculate Risk Scores
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Guest Sample Data Helper (for non-admins) */}
          {user.role !== "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-8"
            >
              <Card className="glass rounded-2xl border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Need data to explore?
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <p className="text-white/80">
                    Load a small sample dataset to explore the dashboard without admin access.
                  </p>
                  <Button
                    onClick={handleGenerateGuestSample}
                    className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                  >
                    Load Guest Sample Data
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="glass rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-white">Filters</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Select
                  value={filters.department}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, department: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="w-48 glass border-white/20 text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.riskLevel}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="w-48 glass border-white/20 text-white">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-white">Students Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-white/90">Name</TableHead>
                        <TableHead className="text-white/90">Department</TableHead>
                        <TableHead className="text-white/90">Semester</TableHead>
                        <TableHead className="text-white/90">Attendance</TableHead>
                        <TableHead className="text-white/90">GPA</TableHead>
                        <TableHead className="text-white/90">Fee Status</TableHead>
                        <TableHead className="text-white/90">Risk Score</TableHead>
                        <TableHead className="text-white/90">Risk Level</TableHead>
                        <TableHead className="text-white/90">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students?.map((student) => (
                        <TableRow key={student._id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-medium">{student.name}</TableCell>
                          <TableCell className="text-white/80">{student.department}</TableCell>
                          <TableCell className="text-white/80">{student.semester}</TableCell>
                          <TableCell className="text-white/80">{student.attendancePercentage.toFixed(1)}%</TableCell>
                          <TableCell className="text-white/80">{student.gpa.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={student.feeStatus === "paid" ? "default" : 
                                      student.feeStatus === "pending" ? "secondary" : "destructive"}
                              className="capitalize"
                            >
                              {student.feeStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/80">
                            {student.riskScore ? (student.riskScore * 100).toFixed(1) + "%" : "N/A"}
                          </TableCell>
                          <TableCell>
                            {student.riskLevel && (
                              <Badge 
                                variant={getRiskBadgeVariant(student.riskLevel)}
                                className={`capitalize ${getRiskColor(student.riskLevel)}`}
                              >
                                {student.riskLevel}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass border-white/20 text-white hover:bg-white/10"
                              onClick={() => navigate(`/student/${student.studentId}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}