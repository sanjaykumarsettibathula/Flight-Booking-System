import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plane,
  MapPin,
  Clock,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function BookingModal({
  isOpen,
  onClose,
  flight,
  currentPrice,
  walletBalance,
  onConfirmBooking,
  isProcessing,
  surgeApplied,
}) {
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [error, setError] = useState("");

  const insufficientBalance = walletBalance < currentPrice;

  const handleSubmit = () => {
    setError("");

    if (!passengerName.trim()) {
      setError("Please enter passenger name");
      return;
    }
    if (!passengerEmail.trim() || !passengerEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!passengerPhone.trim() || !/^\d{10}$/.test(passengerPhone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (insufficientBalance) {
      setError("Insufficient wallet balance");
      return;
    }

    onConfirmBooking({
      passengerName: passengerName.trim(),
      passengerEmail: passengerEmail.trim(),
      passengerPhone: passengerPhone.trim(),
    });
  };

  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-slate-600" />
            Confirm Booking
          </DialogTitle>
          <DialogDescription>
            Review your flight details and complete the booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">
                {flight.airline}
              </span>
              <span className="text-sm text-slate-500">{flight.flight_id}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {flight.departure_time}
                </p>
                <p className="text-sm text-slate-600">
                  {flight.departure_city}
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-px w-12 bg-slate-300" />
                  <Clock className="h-4 w-4" />
                  <div className="h-px w-12 bg-slate-300" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {flight.arrival_time}
                </p>
                <p className="text-sm text-slate-600">{flight.arrival_city}</p>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500">
              {flight.duration} • {flight.aircraft}
            </div>
          </div>

          {/* Passenger Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Passenger Details</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-600">Full Name</Label>
                <Input
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Enter passenger name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Email</Label>
                <Input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-600">Phone Number</Label>
                <Input
                  type="tel"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Base Fare</span>
              <span>₹{flight.base_price?.toLocaleString()}</span>
            </div>
            {surgeApplied && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Surge Pricing (+10%)</span>
                <span>
                  ₹{Math.round(flight.base_price * 0.1).toLocaleString()}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className={surgeApplied ? "text-red-600" : ""}>
                ₹{currentPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              insufficientBalance ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet
                className={`h-5 w-5 ${
                  insufficientBalance ? "text-red-600" : "text-green-600"
                }`}
              />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            <span
              className={`font-semibold ${
                insufficientBalance ? "text-red-600" : "text-green-600"
              }`}
            >
              ₹{walletBalance?.toLocaleString()}
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || insufficientBalance}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
