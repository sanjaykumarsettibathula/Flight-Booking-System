import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function FlightCard({
  flight,
  currentPrice,
  surgeActive,
  onBook,
  surgeCountdown,
}) {
  const hasDiscount = currentPrice < flight.base_price;
  const hasSurge = currentPrice > flight.base_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-48">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
              <Plane className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{flight.airline}</p>
              <p className="text-sm text-slate-500">{flight.flight_id}</p>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex-1 grid grid-cols-3 gap-4 items-center">
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-slate-900">
                {flight.departure_time}
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-1 justify-center lg:justify-start">
                <MapPin className="h-3 w-3" />
                {flight.departure_city}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-px w-8 bg-slate-300" />
                <Clock className="h-4 w-4" />
                <div className="h-px w-8 bg-slate-300" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{flight.duration}</p>
            </div>

            <div className="text-center lg:text-right">
              <p className="text-2xl font-bold text-slate-900">
                {flight.arrival_time}
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-1 justify-center lg:justify-end">
                <MapPin className="h-3 w-3" />
                {flight.arrival_city}
              </p>
            </div>
          </div>

          {/* Price & Booking */}
          <div className="flex flex-col items-center lg:items-end gap-2 lg:w-48">
            {hasSurge && (
              <div className="flex items-center gap-1">
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1 text-xs"
                >
                  <TrendingUp className="h-3 w-3" />
                  Surge +10%
                </Badge>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              {hasSurge && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{flight.base_price.toLocaleString()}
                </span>
              )}
              <span
                className={`text-2xl font-bold ${
                  hasSurge ? "text-red-600" : "text-slate-900"
                }`}
              >
                ₹{currentPrice.toLocaleString()}
              </span>
            </div>

            {surgeActive && surgeCountdown > 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Resets in {Math.floor(surgeCountdown / 60)}:
                {String(surgeCountdown % 60).padStart(2, "0")}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{flight.available_seats} seats left</span>
              <span>•</span>
              <span>{flight.aircraft}</span>
            </div>

            <Button
              onClick={() => onBook(flight)}
              className="w-full lg:w-auto mt-2 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
