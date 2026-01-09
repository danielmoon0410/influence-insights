import { Link, useLocation } from "react-router-dom";
import { Activity, Users, Newspaper, BarChart3, Home } from "lucide-react";
const navItems = [{
  path: "/",
  label: "Home",
  icon: Home
}, {
  path: "/rankings",
  label: "Power Rankings",
  icon: Users
}, {
  path: "/news",
  label: "Today's News",
  icon: Newspaper
}, {
  path: "/markets",
  label: "Markets",
  icon: BarChart3
}];
export const Navbar = () => {
  const location = useLocation();
  return <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-node-blue flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg group-hover:blur-xl transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Echonomics
            </span>
              <span className="text-xs text-muted-foreground">AI-Driven Analytics</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">{item.label}</span>
                </Link>;
          })}
          </div>
        </div>
      </div>
    </nav>;
};