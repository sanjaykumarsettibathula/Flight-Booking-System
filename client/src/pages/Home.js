import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../client/src/utils/api";
import FlightCard from "../components/flight/FlightCard";
import SearchFilters from "../components/flight/SearchFilters";
import BookingModal from "../components/booking/BookingModal";
import BookingSuccess from "../components/booking/BookingSuccess";
import WalletCard from "../components/wallet/WalletCard";

export default function Home() {
  const [filters, setFilters] = useState({
    departure: "all",
    arrival: "all",
    airline: "all",
    sortBy: "price_asc",
  });

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track booking attempts for surge pricing
  const [flightPrices, setFlightPrices] = useState({});
  const [surgeCountdowns, setSurgeCountdowns] = useState({});

  const queryClient = useQueryClient();

  // Fetch current user (simplified - in a real app, you'd get this from auth context)
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Fetch flights
  const { data: flights = [], isLoading: flightsLoading } = useQuery({
    queryKey: ["flights"],
    queryFn: async () => {
      try {
        const data = await api.getFlights();
        return data.slice(0, 10); // Return max 10 flights
      } catch (error) {
        toast.error("Failed to load flights");
        return [];
      }
    },
  });

  // Fetch user wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", user?.email],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await api.getWallet();
      } catch (error) {
        toast.error("Failed to load wallet");
        return null;
      }
    },
    enabled: !!user,
  });

  // Calculate surge pricing for each flight
  useEffect(() => {
    const calculatePrices = async () => {
      if (!flights.length || !user) return;

      const newPrices = {};
      const newCountdowns = {};

      for (const flight of flights) {
        // Get booking attempts for this flight by current user in last 10 minutes
        const tenMinutesAgo = new Date(
          Date.now() - 10 * 60 * 1000
        ).toISOString();
        const attempts = await base44.entities.BookingAttempt.filter({
          flight_id: flight.flight_id,
          created_by: user.email,
          created_date: { $gte: tenMinutesAgo },
        });

        // Calculate if surge pricing applies (3+ attempts in 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentAttempts = attempts.filter(
          (a) => new Date(a.created_date) >= fiveMinutesAgo
        );

        if (recentAttempts.length >= 3) {
          newPrices[flight.id] = Math.round(flight.base_price * 1.1);

          // Find oldest attempt to calculate countdown
          const oldestAttempt = recentAttempts.sort(
            (a, b) => new Date(a.created_date) - new Date(b.created_date)
          )[0];
          const resetTime = new Date(
            new Date(oldestAttempt.created_date).getTime() + 10 * 60 * 1000
          );
          const secondsLeft = Math.max(
            0,
            Math.floor((resetTime - new Date()) / 1000)
          );
          newCountdowns[flight.id] = secondsLeft;
        } else {
          newPrices[flight.id] = flight.base_price;
          newCountdowns[flight.id] = 0;
        }
      }

      setFlightPrices(newPrices);
      setSurgeCountdowns(newCountdowns);
    };

    calculatePrices();
    const interval = setInterval(calculatePrices, 30000); // Refresh every 30 seconds instead of 5

    return () => clearInterval(interval);
  }, [flights, user]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSurgeCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 1);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBookFlight = async (flight) => {
    if (!user) {
      toast.error("Please log in to book a flight");
      return;
    }

    try {
      // Record booking attempt
      await api.createBookingAttempt({
        flight_id: flight._id,
        attempt_time: new Date().toISOString(),
        user_email: user.email,
      });

      setSelectedFlight(flight);
      setShowBookingModal(true);

      // Refresh pricing after recording attempt
      queryClient.invalidateQueries(["flights"]);
    } catch (error) {
      toast.error("Failed to initiate booking");
      console.error(error);
    }
  };

  const handleConfirmBooking = async (passengerDetails) => {
    if (!selectedFlight || !wallet) return;

    setIsProcessing(true);
    try {
      const currentPrice =
        flightPrices[selectedFlight._id] || selectedFlight.base_price;
      const surgeApplied = currentPrice > selectedFlight.base_price;

      // Check wallet balance
      if (wallet.balance < currentPrice) {
        toast.error("Insufficient wallet balance");
        setIsProcessing(false);
        return;
      }

      // Create booking
      const booking = await api.createBooking({
        flight: selectedFlight._id,
        passengerName: passengerDetails.passengerName,
        passengerEmail: passengerDetails.passengerEmail,
        passengerPhone: passengerDetails.passengerPhone,
        amountPaid: currentPrice,
        basePrice: selectedFlight.base_price,
        surgeApplied,
        seatNumber:
          passengerDetails.seatNumber ||
          `A${Math.floor(Math.random() * 30) + 1}`,
        journeyDate: new Date().toISOString(),
      });

      // Refresh data
      queryClient.invalidateQueries(["wallet"]);
      queryClient.invalidateQueries(["flights"]);

      setLastBooking(booking);
      setShowBookingModal(false);
      setShowSuccessModal(true);

      toast.success("Booking confirmed successfully!");
    } catch (error) {
      toast.error(error.message || "Booking failed. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTicket = (booking) => {
    toast.success("Downloading ticket...");
  };

  // Filter and sort flights
  const filteredFlights = flights
    .filter((flight) => {
      if (
        filters.departure !== "all" &&
        flight.departure_city !== filters.departure
      )
        return false;
      if (filters.arrival !== "all" && flight.arrival_city !== filters.arrival)
        return false;
      if (filters.airline !== "all" && flight.airline !== filters.airline)
        return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = flightPrices[a.id] || a.base_price;
      const priceB = flightPrices[b.id] || b.base_price;

      switch (filters.sortBy) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "departure":
          return a.departure_time.localeCompare(b.departure_time);
        case "duration":
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

  const handleSearch = () => {
    queryClient.invalidateQueries(["flights"]);
    toast.success("Search updated");
  };

  const handleClearFilters = () => {
    setFilters({
      departure: "all",
      arrival: "all",
      airline: "all",
      sortBy: "price_asc",
    });
    toast.success("Filters cleared");
  };

  if (flightsLoading || walletLoading) {
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Find Your Perfect Flight
          </h1>
          <p className="text-slate-600">Search and book flights with ease</p>
        </div>

        {/* Wallet */}
        {wallet && (
          <WalletCard
            balance={wallet.balance}
            recentTransactions={wallet.transactions || []}
          />
        )}

        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onClear={handleClearFilters}
        />

        {/* Flight Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Available Flights ({filteredFlights.length})
            </h2>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No flights found matching your criteria
              </p>
            </div>
          ) : (
            filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                currentPrice={flightPrices[flight.id] || flight.base_price}
                surgeActive={
                  (flightPrices[flight.id] || flight.base_price) >
                  flight.base_price
                }
                surgeCountdown={surgeCountdowns[flight.id] || 0}
                onBook={handleBookFlight}
              />
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        flight={selectedFlight}
        currentPrice={
          selectedFlight
            ? flightPrices[selectedFlight.id] || selectedFlight.base_price
            : 0
        }
        walletBalance={wallet?.balance || 0}
        onConfirmBooking={handleConfirmBooking}
        isProcessing={isProcessing}
        surgeApplied={
          selectedFlight &&
          (flightPrices[selectedFlight.id] || selectedFlight.base_price) >
            selectedFlight.base_price
        }
      />

      {/* Success Modal */}
      <BookingSuccess
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        booking={lastBooking}
        onDownloadTicket={handleDownloadTicket}
      />
    </div>
  );
}
