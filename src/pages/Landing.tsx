import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  GraduationCap,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze student data to predict dropout risks with high accuracy."
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Monitor student performance metrics including attendance, GPA trends, and fee payment status."
    },
    {
      icon: AlertTriangle,
      title: "Early Warning System",
      description: "Automated alerts notify mentors when students are flagged as high-risk for timely intervention."
    },
    {
      icon: Users,
      title: "Counseling Management",
      description: "Track counseling sessions, mentor notes, and action items for comprehensive student support."
    }
  ];

  const benefits = [
    "Reduce dropout rates by up to 40%",
    "Identify at-risk students early",
    "Streamline counseling workflows",
    "Data-driven decision making",
    "Improve student retention",
    "Automated risk assessment"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong border-b border-white/20 relative z-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">
                AI Dropout Predictor
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white/80">
                    Welcome, {user?.name || user?.email}
                  </span>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-8">
            <div className="glass-strong rounded-full p-6">
              <Brain className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dropout Prevention
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Harness the power of artificial intelligence to identify at-risk students early, 
            provide targeted interventions, and improve retention rates across your institution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-lg px-8 py-4"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-lg px-8 py-4"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="glass rounded-2xl border-0 h-full hover:glass-strong transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="glass-strong rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Transform Student Success
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Our AI-powered platform helps educational institutions proactively 
              identify students at risk of dropping out and provides the tools 
              needed for effective intervention.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Card className="glass-strong rounded-2xl border-0 p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">85%</div>
                <p className="text-white/80 text-lg mb-6">
                  Average improvement in student retention rates
                </p>
                
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                    <p className="text-white/70 text-sm">Monitoring</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
                    <p className="text-white/70 text-sm">Accuracy</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="glass-strong rounded-2xl border-0 p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Student Success?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of educational institutions already using our AI-powered 
              platform to improve student retention and success rates.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-lg px-8 py-4"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Get Started Today
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  Schedule Demo
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 glass-strong border-t border-white/20 mt-20"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 AI Dropout Predictor. Powered by advanced machine learning.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}