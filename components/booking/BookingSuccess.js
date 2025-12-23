import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Plane, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingSuccess({
  isOpen,
  onClose,
  booking,
  onDownloadTicket,
}) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </motion.div>

          <div className="text-center space-y-2">
            <p className="text-slate-600">Your booking has been confirmed</p>
            <div className="bg-slate-100 rounded-lg px-6 py-3">
              <p className="text-sm text-slate-500">PNR Number</p>
              <p className="text-2xl font-bold text-slate-900 tracking-wider">
                {booking.pnr}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium">
                  {booking.airline} • {booking.flight_id}
                </p>
                <p className="text-sm text-slate-500">
                  {booking.departure_city} → {booking.arrival_city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Booking Date</p>
                <p className="font-medium">
                  {new Date(booking.booking_date).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-600">Amount Paid</span>
              <span className="font-bold text-green-600">
                ₹{booking.amount_paid.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => onDownloadTicket(booking)}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
