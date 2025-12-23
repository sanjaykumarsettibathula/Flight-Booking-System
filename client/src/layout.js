import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plane, Home, History, LogOut, User } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navItems = [
    { name: "Home", icon: Home, path: "Home" },
    { name: "My Bookings", icon: History, path: "BookingHistory" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to={createPageUrl("Home")}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FlightBook</h1>
                <p className="text-xs text-slate-500">Your travel companion</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">
                      {user.full_name || user.email}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-slate-200"
                  >
                    <LogOut className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-2 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-slate-400" />
              <p className="text-sm text-slate-600">
                © 2024 FlightBook. Built for XTechon Assignment.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
