import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  FaPlane,
  FaArrowRight,
  FaClock,
  FaChair,
  FaTag,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetFlightQuery } from "../../features/flights/flightSlice";
import { useCreateBookingMutation } from "../../features/bookings/bookingSlice";
import { useGetWalletQuery } from "../../features/wallet/walletSlice";

const FlightDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: flightResponse, isLoading: flightLoading, error: flightError } = useGetFlightQuery(id);
  const flight = flightResponse?.data;
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const { data: walletData } = useGetWalletQuery(undefined, { skip: !isAuthenticated });
  const walletBalance = walletData?.data?.balance || 0;

  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Get passenger count and trip type from location state or default to 1
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const passengers = searchParams.get("passengers") || location.state?.passengers || 1;
    setPassengerCount(parseInt(passengers));

    // Pre-fill contact info if user is authenticated
    if (isAuthenticated && user) {
      setContactInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [id, location, isAuthenticated, user]);

  const handleSeatSelect = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length < passengerCount) {
          return [...prev, seatId];
        }
        return prev;
      }
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (selectedSeats.length < passengerCount) {
      toast.error(`Please select ${passengerCount} seat(s)`);
      return;
    }

    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      toast.error("Please fill in all contact information");
      return;
    }

    if (!flight) {
      toast.error("Flight information not available");
      return;
    }

    const totalAmount = Math.round((flight.currentPrice || flight.basePrice) * passengerCount * 1.15);

    if (walletBalance < totalAmount) {
      toast.error(`Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${walletBalance}`);
      return;
    }

    try {
      // Create booking for each passenger/seat
      const bookings = [];
      for (let i = 0; i < passengerCount; i++) {
        const bookingData = {
          flightId: id,
          passengerName: contactInfo.name,
          passengerEmail: contactInfo.email,
          passengerPhone: contactInfo.phone,
          seatNumber: selectedSeats[i] || `AUTO${i + 1}`,
          journeyDate: flight.departureTime,
        };

        const result = await createBooking(bookingData).unwrap();
        bookings.push(result?.data || result);
      }

      // Navigate to confirmation with the first booking
      if (bookings.length > 0) {
        const firstBooking = bookings[0];
        // Fetch the full booking with populated flight data if needed
        try {
          const bookingId = firstBooking._id || firstBooking.id;
          if (bookingId) {
            const fullBookingResponse = await fetch(
              `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/bookings/${bookingId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (fullBookingResponse.ok) {
              const fullBookingData = await fullBookingResponse.json();
              const fullBooking = fullBookingData.data || fullBookingData;
              navigate("/bookings/confirmation", {
                state: {
                  booking: {
                    ...fullBooking,
                    flight: fullBooking.flight || flight,
                    passengerCount,
                    totalAmount,
                    contactInfo,
                    bookingId: fullBooking.pnr || fullBooking._id,
                    bookingDate: fullBooking.bookingDate || new Date().toISOString(),
                  },
                },
              });
              toast.success("Booking confirmed successfully!");
              return;
            }
          }
        } catch (fetchError) {
          console.error("Error fetching full booking:", fetchError);
        }
        
        // Fallback to basic booking data
        navigate("/bookings/confirmation", {
          state: {
            booking: {
              ...firstBooking,
              flight,
              passengerCount,
              totalAmount,
              contactInfo,
              bookingId: firstBooking.pnr || firstBooking._id,
              bookingDate: firstBooking.bookingDate || new Date().toISOString(),
            },
          },
        });
        toast.success("Booking confirmed successfully!");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create booking. Please try again.");
    }
  };

  // Show loading state
  if (flightLoading) {
    return (
      <Container>
        <LoadingMessage>Loading flight details...</LoadingMessage>
      </Container>
    );
  }

  // Show error state
  if (flightError || !flight) {
    return (
      <Container>
        <ErrorMessage>
          <h2>Flight not found</h2>
          <p>Unable to load flight details. Please try again.</p>
          <button onClick={() => navigate("/flights")}>Back to Search</button>
        </ErrorMessage>
      </Container>
    );
  }

  // Calculate duration
  const getDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return "N/A";
    const diffMs = new Date(arrivalTime) - new Date(departureTime);
    const totalMinutes = Math.max(0, Math.round(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Generate mock seats (in a real app, this would come from the API)
  const generateSeats = () => {
    const totalSeats = flight.totalSeats || 100;
    const availableSeats = flight.availableSeats || totalSeats;
    const bookedSeats = totalSeats - availableSeats;
    
    return Array(totalSeats)
      .fill()
      .map((_, i) => {
        const seatId = `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`;
        const isBooked = i < bookedSeats;
        return {
          id: seatId,
          available: !isBooked,
          type: i < 12 ? "business" : "economy",
          price: i < 12 ? (flight.currentPrice || flight.basePrice) * 1.5 : (flight.currentPrice || flight.basePrice),
        };
      });
  };

  const generatedSeats = generateSeats();
  const flightData = {
    ...flight,
    duration: getDuration(flight.departureTime, flight.arrivalTime),
    departureTime: formatTime(flight.departureTime),
    arrivalTime: formatTime(flight.arrivalTime),
    departureDate: formatDate(flight.departureTime),
    arrivalDate: formatDate(flight.arrivalTime),
    price: flight.currentPrice || flight.basePrice,
    seats: generatedSeats,
  };

  const {
    flightNumber,
    departureCity,
    arrivalCity,
    departureTime,
    arrivalTime,
    duration,
    price,
    departureDate,
    arrivalDate,
    seats,
  } = flightData;

  const businessSeats = seats.filter((seat) => seat.type === "business");
  const economySeats = seats.filter((seat) => seat.type === "economy");

  return (
    <Container>
      <FlightHeader>
        <div>
          <h1>Flight Details</h1>
          <p>Review your flight and complete your booking</p>
        </div>
        <FlightSummary>
          <div>
            <div className="time">{departureTime}</div>
            <div className="city">{departureCity.split(" (")[0]}</div>
          </div>
          <FlightRoute>
            <div className="duration">{duration}</div>
            <div className="line" />
            <div className="stops">Non-stop</div>
          </FlightRoute>
            <div className="text-right">
            <div className="time">{arrivalTime}</div>
            <div className="city">{arrivalCity}</div>
            <div className="date">{arrivalDate}</div>
          </div>
          <div className="flight-number">
            <FaPlane /> {flightNumber}
          </div>
        </FlightSummary>
      </FlightHeader>

      <Content>
        <MainContent>
          <Section>
            <SectionTitle>Select Seats</SectionTitle>
            <PassengerCount>
              <span>Passengers: {passengerCount}</span>
              <span>
                {selectedSeats.length} of {passengerCount} seats selected
              </span>
            </PassengerCount>

            <SeatMap>
              <SeatClass>Business Class</SeatClass>
              <SeatGrid>
                {businessSeats.map((seat) => (
                  <Seat
                    key={seat.id}
                    available={seat.available}
                    selected={selectedSeats.includes(seat.id)}
                    onClick={() => seat.available && handleSeatSelect(seat.id)}
                    type={seat.type}
                  >
                    {seat.id}
                  </Seat>
                ))}
              </SeatGrid>

              <SeatClass>Economy Class</SeatClass>
              <SeatGrid>
                {economySeats.map((seat) => (
                  <Seat
                    key={seat.id}
                    available={seat.available}
                    selected={selectedSeats.includes(seat.id)}
                    onClick={() => seat.available && handleSeatSelect(seat.id)}
                    type={seat.type}
                  >
                    {seat.id}
                  </Seat>
                ))}
              </SeatGrid>

              <SeatLegend>
                <LegendItem>
                  <Seat available={false} />
                  <span>Booked</span>
                </LegendItem>
                <LegendItem>
                  <Seat available={true} selected={false} />
                  <span>Available</span>
                </LegendItem>
                <LegendItem>
                  <Seat available={true} selected={true} />
                  <span>Selected</span>
                </LegendItem>
              </SeatLegend>
            </SeatMap>
          </Section>

          <Section>
            <SectionTitle>Contact Information</SectionTitle>
            <ContactForm>
              <FormGroup>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactInfo.name}
                  onChange={handleContactChange}
                  placeholder="John Doe"
                  required
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    placeholder="your@email.com"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleContactChange}
                    placeholder="+1 (123) 456-7890"
                    required
                  />
                </FormGroup>
              </FormRow>
            </ContactForm>
          </Section>
        </MainContent>

        <Sidebar>
          <BookingSummary>
            <SummaryHeader>Booking Summary</SummaryHeader>
            <FlightInfo>
              <div className="route">
                <div className="cities">
                  <span>{departureCity.split(" (")[0]}</span>
                  <FaArrowRight />
                  <span>{arrivalCity.split(" (")[0]}</span>
                </div>
                <div className="date">{departureDate}</div>
              </div>
              <FlightMeta>
                <div>
                  <FaClock /> {duration}
                </div>
                <div>
                  <FaChair /> {selectedSeats.length} Seat(s) Selected
                </div>
                <div>
                  <FaTag />{" "}
                  {selectedSeats.length > 0 ? "Economy" : "No seats selected"}
                </div>
              </FlightMeta>
            </FlightInfo>

            <PriceBreakdown>
              <PriceRow>
                <span>
                  Base Fare ({passengerCount} x ₹{price})
                </span>
                <span>₹{price * passengerCount}</span>
              </PriceRow>
              <PriceRow>
                <span>Taxes & Fees</span>
                <span>₹{Math.round(price * passengerCount * 0.15)}</span>
              </PriceRow>
              <Divider />
              <TotalPrice>
                <span>Total Amount</span>
                <span>₹{Math.round(price * passengerCount * 1.15)}</span>
              </TotalPrice>
            </PriceBreakdown>

            <BookButton
              onClick={handleBookNow}
              disabled={selectedSeats.length < passengerCount || isBooking || !contactInfo.name || !contactInfo.email || !contactInfo.phone}
            >
              {isBooking ? "Processing..." : isAuthenticated ? "Book Now" : "Sign In to Book"}
            </BookButton>
            
            {isAuthenticated && (
              <WalletInfo>
                <span>Wallet Balance: ₹{walletBalance.toLocaleString()}</span>
                {walletBalance < Math.round((flight?.currentPrice || flight?.basePrice || 0) * passengerCount * 1.15) && (
                  <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>
                    Insufficient balance
                  </span>
                )}
              </WalletInfo>
            )}

            <Guarantee>
              <FaCheckCircle />
              <span>Best Price Guaranteed</span>
            </Guarantee>
          </BookingSummary>
        </Sidebar>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const FlightHeader = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2rem;
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.black};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray};
  }
`;

const FlightSummary = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};

  > div {
    flex: 1;
  }

  .time {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.black};
  }

  .city {
    color: ${({ theme }) => theme.colors.gray};
    font-size: 0.875rem;
  }

  .text-right {
    text-align: right;
  }

  .flight-number {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    margin-left: 2rem;
  }
`;

const FlightRoute = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  .duration {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 0.5rem;
  }

  .line {
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.colors.grayLight};
    position: relative;
    margin: 0.5rem 0;

    &::before {
      content: "";
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-top: 2px solid ${({ theme }) => theme.colors.grayLight};
      border-right: 2px solid ${({ theme }) => theme.colors.grayLight};
      transform: rotate(45deg);
    }
  }

  .stops {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.gray};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.black};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PassengerCount = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.grayLighter};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.5rem;
  font-size: 0.875rem;

  span {
    font-weight: 500;

    &:last-child {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const SeatMap = styled.div`
  margin-bottom: 1.5rem;
`;

const SeatClass = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const Seat = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  background: ${({ theme, available, selected }) =>
    !available
      ? theme.colors.grayLight
      : selected
      ? theme.colors.primary
      : theme.colors.grayLighter};
  color: ${({ theme, available, selected }) =>
    !available
      ? theme.colors.gray
      : selected
      ? theme.colors.white
      : theme.colors.grayDark};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: ${({ available }) => (available ? "pointer" : "not-allowed")};
  transition: all 0.2s ease;

  &:hover {
    transform: ${({ available }) => (available ? "scale(1.1)" : "none")};
  }
`;

const SeatLegend = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const ContactForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.grayDark};
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.grayLight};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: 0.875rem;
    transition: ${({ theme }) => theme.transitions.default};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}40;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayLight};
    }
  }
`;

const Sidebar = styled.div`
  @media (max-width: 992px) {
    grid-row: 1;
  }
`;

const BookingSummary = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  position: sticky;
  top: 2rem;
`;

const SummaryHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1.25rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
`;

const FlightInfo = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};

  .route {
    margin-bottom: 1rem;
  }

  .cities {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;

    svg {
      color: ${({ theme }) => theme.colors.gray};
      font-size: 0.75rem;
    }
  }

  .date {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};
  }
`;

const FlightMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grayDark};

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: ${({ theme }) => theme.colors.gray};
      font-size: 0.875rem;
    }
  }
`;

const PriceBreakdown = styled.div`
  padding: 1.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.grayLighter};
  margin: 1rem 0;
`;

const TotalPrice = styled(PriceRow)`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 1rem;
`;

const BookButton = styled.button`
  display: block;
  width: calc(100% - 3rem);
  margin: 0 1.5rem 1.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.grayLight};
    cursor: not-allowed;
  }
`;

const Guarantee = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  color: ${({ theme }) => theme.colors.gray};
  font-size: 0.875rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 1.5rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grayDark};
  
  span:first-child {
    font-weight: 500;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};

  h2 {
    color: ${({ theme }) => theme.colors.danger};
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.default};

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }
  }
`;

export default FlightDetailsPage;
