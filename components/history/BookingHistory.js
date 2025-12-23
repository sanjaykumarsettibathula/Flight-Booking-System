import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plane,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  TrendingUp,
} from "lucide-react";
import TicketPDF from "@/components/booking/TicketPDF";

export default function BookingHistoryCard({ booking }) {
  return (
    <Card className="p-6 bg-white border border-slate-200 hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Flight Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Plane className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{booking.airline}</p>
              <p className="text-sm text-slate-500">{booking.flight_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{booking.departure_city}</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{booking.arrival_city}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <span>•</span>
            <span className="font-mono">{booking.passenger_name}</span>
          </div>
        </div>

        {/* PNR & Price */}
        <div className="flex flex-col items-end gap-3">
          <div className="bg-slate-100 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-slate-500">PNR</p>
            <p className="font-bold text-slate-900 tracking-wider">
              {booking.pnr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {booking.surge_applied && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Surge
              </Badge>
            )}
            <div className="flex items-center gap-1 text-green-600">
              <CreditCard className="h-4 w-4" />
              <span className="font-bold">
                ₹{booking.amount_paid?.toLocaleString()}
              </span>
            </div>
          </div>

          <TicketPDF booking={booking} />
        </div>
      </div>
    </Card>
  );
}
