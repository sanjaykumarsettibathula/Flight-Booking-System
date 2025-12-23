import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Plane,
  MapPin,
  Calendar,
  User,
  Mail,
  CreditCard,
  Hash,
} from "lucide-react";

export default function TicketPDF({ booking, onDownload }) {
  const ticketRef = useRef(null);

  const generatePDF = async () => {
    const ticketElement = ticketRef.current;
    if (!ticketElement) return;

    // Create a canvas from the ticket content
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(ticketElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ticket-${booking.pnr}.pdf`);

    if (onDownload) onDownload();
  };

  return (
    <div>
      {/* Hidden ticket template for PDF generation */}
      <div className="fixed -left-[9999px]">
        <div ref={ticketRef} className="w-[600px] bg-white p-8">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plane className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Flight Ticket</h1>
                  <p className="text-slate-300 text-sm">
                    E-Ticket / Boarding Pass
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">PNR Number</p>
                <p className="text-2xl font-bold tracking-wider">
                  {booking.pnr}
                </p>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="border-l border-r border-slate-200 p-6 space-y-6">
            {/* Route */}
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {booking.departure_time || "—"}
                </p>
                <div className="flex items-center gap-1 text-slate-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{booking.departure_city}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center px-8">
                <div className="flex items-center w-full">
                  <div className="h-px flex-1 bg-slate-300" />
                  <Plane className="h-5 w-5 text-slate-400 mx-2 rotate-90" />
                  <div className="h-px flex-1 bg-slate-300" />
                </div>
                <p className="text-sm text-slate-500 mt-1">{booking.airline}</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">—</p>
                <div className="flex items-center gap-1 text-slate-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{booking.arrival_city}</span>
                </div>
              </div>
            </div>

            {/* Passenger & Flight Info */}
            <div className="grid grid-cols-2 gap-6 py-4 border-t border-b border-dashed border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Passenger Name</p>
                    <p className="font-semibold text-slate-900">
                      {booking.passenger_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-700">
                      {booking.passenger_email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Flight Number</p>
                    <p className="font-semibold text-slate-900">
                      {booking.flight_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Booking Date</p>
                    <p className="font-medium text-slate-700">
                      {new Date(booking.booking_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Amount Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{booking.amount_paid?.toLocaleString()}
                    </p>
                  </div>
                </div>
                {booking.surge_applied && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Surge pricing applied
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-100 p-4 rounded-b-xl text-center">
            <p className="text-xs text-slate-500">
              Please arrive at the airport at least 2 hours before departure.
              Present this ticket along with a valid ID.
            </p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button onClick={generatePDF} className="bg-slate-900 hover:bg-slate-800">
        <Download className="h-4 w-4 mr-2" />
        Download Ticket
      </Button>
    </div>
  );
}
