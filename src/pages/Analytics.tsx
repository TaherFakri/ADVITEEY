import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BarChart3, AlertTriangle, Users } from "lucide-react";

export default function AnalyticsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const riskDistribution = useQuery(api.students.getRiskDistribution);
  const highRiskStudents = useQuery(api.students.getHighRiskStudents);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const total =
    (riskDistribution?.low || 0) +
    (riskDistribution?.medium || 0) +
    (riskDistribution?.high || 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-white">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{total}</div>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-white">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">{riskDistribution?.high || 0}</div>
              </CardContent>
            </Card>
            <Card className="glass rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-white">Medium Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">{riskDistribution?.medium || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass rounded-2xl border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                High Risk Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highRiskStudents && highRiskStudents.length > 0 ? (
                <div className="space-y-3">
                  {highRiskStudents.map((s) => (
                    <div key={s._id} className="glass-strong rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{s.name}</div>
                        <div className="text-white/70 text-sm">
                          {s.department} • Sem {s.semester}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-red-400 font-bold">
                          {s.riskScore ? `${(s.riskScore * 100).toFixed(0)}%` : "N/A"}
                        </div>
                        {s.riskLevel && (
                          <Badge variant="destructive" className="capitalize">
                            {s.riskLevel}
                          </Badge>
                        )}
                        <Users className="h-4 w-4 text-white/60" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-center py-10">No high risk students found.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
