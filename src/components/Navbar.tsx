import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Bell, LogOut, User, Home, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong border-b border-white/20 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">
              AI Dropout Predictor
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`text-white hover:bg-white/10 ${
                    isActive ? "bg-white/20" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {user?.name || user?.email || "User"}
              </span>
              {user?.role && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
