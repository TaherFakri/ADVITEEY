import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Mail, Phone, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

export default function StudentDetail() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [counselingNotes, setCounselingNotes] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const student = useQuery(api.students.getStudent, studentId ? { studentId } : "skip");
  const counselingSessions = useQuery(
    api.counseling.getStudentCounselingSessions, 
    studentId ? { studentId } : "skip"
  );
  const createCounselingSession = useMutation(api.counseling.createCounselingSession);
  const calculateRiskScore = useMutation(api.predictions.calculateRiskScore);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center text-white">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !student) {
    return null;
  }

  const handleCreateCounselingSession = async () => {
    if (!counselingNotes.trim()) {
      toast.error("Please enter counseling notes");
      return;
    }

    try {
      await createCounselingSession({
        studentId: student.studentId,
        notes: counselingNotes,
        actionItems: actionItems.split('\n').filter(item => item.trim()),
        followUpDate: followUpDate ? new Date(followUpDate).getTime() : undefined,
        sessionType: "regular",
      });
      
      setCounselingNotes("");
      setActionItems("");
      setFollowUpDate("");
      toast.success("Counseling session recorded successfully!");
    } catch (error) {
      toast.error("Failed to record counseling session");
    }
  };

  const handleRecalculateRisk = async () => {
    try {
      await calculateRiskScore({ studentId: student.studentId });
      toast.success("Risk score recalculated successfully!");
    } catch (error) {
      toast.error("Failed to recalculate risk score");
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
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
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {student.name}
                </h1>
                <p className="text-white/80">
                  Student ID: {student.studentId} • {student.department}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRecalculateRisk}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
            >
              Recalculate Risk
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass rounded-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Email</Label>
                      <p className="text-white">{student.email}</p>
                    </div>
                    <div>
                      <Label className="text-white/80">Department</Label>
                      <p className="text-white">{student.department}</p>
                    </div>
                    <div>
                      <Label className="text-white/80">Semester</Label>
                      <p className="text-white">{student.semester}</p>
                    </div>
                    <div>
                      <Label className="text-white/80">Enrollment Date</Label>
                      <p className="text-white">
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Academic Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass rounded-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        {student.attendancePercentage.toFixed(1)}%
                      </div>
                      <Label className="text-white/80">Attendance</Label>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-3xl font-bold text-white mr-2">
                          {student.gpa.toFixed(2)}
                        </span>
                        {getTrendIcon(student.gpaTrend)}
                      </div>
                      <Label className="text-white/80">GPA</Label>
                    </div>
                    <div className="text-center">
                      <Badge 
                        variant={student.feeStatus === "paid" ? "default" : 
                                student.feeStatus === "pending" ? "secondary" : "destructive"}
                        className="text-lg px-4 py-2 capitalize"
                      >
                        {student.feeStatus}
                      </Badge>
                      <div className="mt-2">
                        <Label className="text-white/80">Fee Status</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Counseling History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass rounded-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Counseling History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {counselingSessions && counselingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {counselingSessions.map((session) => (
                          <div key={session._id} className="glass-strong rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline" className="text-white border-white/30">
                                {session.sessionType}
                              </Badge>
                              <span className="text-sm text-white/60">
                                {new Date(session.sessionDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white mb-2">{session.notes}</p>
                            {session.actionItems.length > 0 && (
                              <div>
                                <Label className="text-white/80 text-sm">Action Items:</Label>
                                <ul className="list-disc list-inside text-white/80 text-sm mt-1">
                                  {session.actionItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60 text-center py-8">
                        No counseling sessions recorded yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Risk Assessment & Actions */}
            <div className="space-y-6">
              {/* Risk Score */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass rounded-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold mb-4 ${getRiskColor(student.riskLevel || "")}`}>
                      {student.riskScore ? (student.riskScore * 100).toFixed(0) + "%" : "N/A"}
                    </div>
                    {student.riskLevel && (
                      <Badge 
                        variant={student.riskLevel === "high" ? "destructive" : 
                                student.riskLevel === "medium" ? "secondary" : "default"}
                        className="text-lg px-4 py-2 capitalize"
                      >
                        {student.riskLevel} Risk
                      </Badge>
                    )}
                    <p className="text-white/60 text-sm mt-4">
                      Last updated: {new Date(student.lastUpdated).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Add Counseling Session */}
              {(user.role === "mentor" || user.role === "admin") && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass rounded-2xl border-0">
                    <CardHeader>
                      <CardTitle className="text-white">Record Counseling Session</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white/80">Session Notes</Label>
                        <Textarea
                          value={counselingNotes}
                          onChange={(e) => setCounselingNotes(e.target.value)}
                          placeholder="Enter counseling session notes..."
                          className="glass border-white/20 text-white placeholder:text-white/50"
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white/80">Action Items (one per line)</Label>
                        <Textarea
                          value={actionItems}
                          onChange={(e) => setActionItems(e.target.value)}
                          placeholder="Enter action items..."
                          className="glass border-white/20 text-white placeholder:text-white/50"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white/80">Follow-up Date</Label>
                        <Input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="glass border-white/20 text-white"
                        />
                      </div>
                      
                      <Button
                        onClick={handleCreateCounselingSession}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Record Session
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
