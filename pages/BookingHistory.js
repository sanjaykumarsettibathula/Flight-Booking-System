import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Calendar,
  TrendingUp,
  CreditCard,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookingHistoryCard from "@/components/history/BookingHistoryCard";

export default function BookingHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allBookings = await base44.entities.Booking.filter(
        { created_by: user.email },
        "-created_date"
      );
      return allBookings;
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats = {
    total: bookings.length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0),
    surgeBookings: bookings.filter((b) => b.surge_applied).length,
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        booking.pnr.toLowerCase().includes(term) ||
        booking.airline.toLowerCase().includes(term) ||
        booking.departure_city.toLowerCase().includes(term) ||
        booking.arrival_city.toLowerCase().includes(term) ||
        booking.passenger_name.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.booking_date) - new Date(a.booking_date);
        case "oldest":
          return new Date(a.booking_date) - new Date(b.booking_date);
        case "price_high":
          return b.amount_paid - a.amount_paid;
        case "price_low":
          return a.amount_paid - b.amount_paid;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Booking History</h1>
          <p className="text-slate-600">View and manage your flight bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{stats.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Surge Bookings</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.surgeBookings}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by PNR, airline, city, or passenger name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 bg-white border border-slate-200 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">
                    No bookings found
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Start booking flights to see them here"}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <BookingHistoryCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
