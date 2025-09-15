import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCircle2, Eye } from "lucide-react";

export default function AlertsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const alerts = useQuery(api.alerts.getAlerts, { isRead: false });
  const markAsRead = useMutation(api.alerts.markAlertAsRead);
  const resolveAlert = useMutation(api.alerts.resolveAlert);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const onMarkRead = async (id: string) => {
    try {
      // @ts-expect-error id type is enforced by Convex at runtime in useMutation
      await markAsRead({ alertId: id });
      toast.success("Alert marked as read");
    } catch {
      toast.error("Failed to mark alert as read");
    }
  };

  const onResolve = async (id: string) => {
    try {
      // @ts-expect-error id type is enforced by Convex at runtime in useMutation
      await resolveAlert({ alertId: id });
      toast.success("Alert resolved");
    } catch {
      toast.error("Failed to resolve alert");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex items-center space-x-3">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Alerts</h1>
          </div>

          <Card className="glass rounded-2xl border-0">
            <CardHeader>
              <CardTitle className="text-white">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((a) => (
                    <div key={a._id} className="glass-strong rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize border-white/30 text-white">
                              {a.alertType.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-white/60 text-sm">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white mt-2">{a.message}</p>
                          <p className="text-white/70 text-sm mt-1">Student ID: {a.studentId}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass border-white/20 text-white hover:bg-white/10"
                            onClick={() => onMarkRead(a._id as unknown as string)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Mark read
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                            onClick={() => onResolve(a._id as unknown as string)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-center py-10">No unread alerts.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
