import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaDownload,
  FaPrint,
  FaEnvelope,
  FaPlane,
  FaClock,
  FaChair,
  FaTag,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  // Fetch booking data if not available in location state
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingId = new URLSearchParams(location.search).get("bookingId");

        if (location.state?.booking) {
          setBooking(location.state.booking);
        } else if (bookingId) {
          // Fetch booking data from API if direct link is used
          const token = localStorage.getItem("token");
          const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/bookings/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Booking not found");
          const data = await response.json();
          setBooking(data.data || data);
        } else {
          throw new Error("No booking data available");
        }
      } catch (err) {
        setError(err.message || "Failed to load booking details");
        console.error("Booking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [location]);

  if (loading) {
    return <LoadingContainer>Loading booking details...</LoadingContainer>;
  }

  if (error || !booking) {
    return (
      <ErrorContainer>
        <h2>Unable to load booking details</h2>
        <p>{error || "No booking information found."}</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </ErrorContainer>
    );
  }

  const {
    bookingId,
    pnr,
    status,
    bookingDate,
    flight = {},
    passengerCount = 1,
    totalAmount = 0,
    amountPaid = 0,
    contactInfo = {},
    passengers = [],
  } = booking;
  
  const displayBookingId = bookingId || pnr || booking._id;
  const displayAmount = totalAmount || amountPaid || 0;

  // Set default values for flight
  const flightData = {
    airline: { name: "Unknown Airline", logo: "" },
    flightNumber: "N/A",
    departure: { airport: {}, time: new Date() },
    arrival: { airport: {}, time: new Date() },
    ...flight,
  };

  const handleDownloadTicket = async () => {
    const ticketElement = document.getElementById("ticket");

    // Use html2canvas to capture the ticket as an image
    const canvas = await html2canvas(ticketElement, {
      scale: 2, // Increase for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Convert canvas to PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Center the image on the page
    const x = (pdf.internal.pageSize.getWidth() - pdfWidth) / 2;

    pdf.addImage(imgData, "PNG", x, 10, pdfWidth, pdfHeight);
    pdf.save(`ticket-${bookingId}.pdf`);
  };

  const handlePrintTicket = async () => {
    const ticketElement = document.getElementById("ticket");
    const canvas = await html2canvas(ticketElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Ticket</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
              .no-print { display: none; }
            }
            img { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="E-Ticket" />
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
              Print
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px; cursor: pointer;">
              Close
            </button>
          </div>
          <script>
            // Auto-print when the window loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleEmailTicket = () => {
    // In a real app, this would trigger an email service
    alert("This would send the ticket to your email in a real application");
  };

  return (
    <Container>
      <ConfirmationHeader>
        <Checkmark>
          <FaCheckCircle />
        </Checkmark>
        <h1>Booking Confirmed!</h1>
        <p>Your booking is confirmed and your e-ticket has been generated.</p>
        <BookingReference>
          PNR: <strong>{displayBookingId}</strong>
        </BookingReference>
      </ConfirmationHeader>

      <ActionButtons>
        <Button primary onClick={handleDownloadTicket}>
          <FaDownload /> Download Ticket
        </Button>
        <Button onClick={handlePrintTicket}>
          <FaPrint /> Print Ticket
        </Button>
        <Button onClick={handleEmailTicket}>
          <FaEnvelope /> Email Ticket
        </Button>
      </ActionButtons>

      <TicketContainer>
        <Ticket id="ticket">
          <TicketHeader>
            <div>
              <h2>E-TICKET</h2>
              <Status status={status}>{status.toUpperCase()}</Status>
            </div>
            <AirlineLogo>
              <FaPlane /> {flight.airline}
            </AirlineLogo>
          </TicketHeader>

          <TicketBody>
            <FlightSection>
              <SectionTitle>Flight Details</SectionTitle>
              <FlightRoute>
                <div className="departure">
                  <div className="time">
                    {flight.departureTime 
                      ? (typeof flight.departureTime === 'string' 
                          ? new Date(flight.departureTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                          : flight.departureTime)
                      : "N/A"}
                  </div>
                  <div className="date">
                    {flight.departureTime 
                      ? new Date(flight.departureTime).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                  <div className="airport">{flight.departureCity || "N/A"}</div>
                </div>

                <FlightDuration>
                  <div className="line" />
                  <div className="duration">{flight.duration}</div>
                  <div className="stops">Non-stop</div>
                </FlightDuration>

                <div className="arrival">
                  <div className="time">
                    {flight.arrivalTime 
                      ? (typeof flight.arrivalTime === 'string' 
                          ? new Date(flight.arrivalTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                          : flight.arrivalTime)
                      : "N/A"}
                  </div>
                  <div className="date">
                    {flight.arrivalTime 
                      ? new Date(flight.arrivalTime).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                  <div className="airport">{flight.arrivalCity || "N/A"}</div>
                </div>
              </FlightRoute>

              <FlightMeta>
                <div>
                  <FaPlane /> {flight.airline || "Unknown"} {flight.flightNumber || "N/A"}
                </div>
                <div>
                  <FaClock /> {flight.duration || "N/A"}
                </div>
                <div>
                  <FaChair /> Economy
                </div>
                <div>
                  <FaTag /> PNR: {displayBookingId}
                </div>
              </FlightMeta>
            </FlightSection>

            <PassengerSection>
              <SectionTitle>Passenger Information</SectionTitle>
              <PassengerInfo>
                <div>
                  <div className="label">Passenger Name</div>
                  <div className="value">{contactInfo.name}</div>
                </div>
                <div>
                  <div className="label">Email</div>
                  <div className="value">{contactInfo.email}</div>
                </div>
                <div>
                  <div className="label">Phone</div>
                  <div className="value">{contactInfo.phone}</div>
                </div>
              </PassengerInfo>

              <BookingDetails>
                <div>
                  <div className="label">Booking Date</div>
                  <div className="value">
                    {bookingDate ? new Date(bookingDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="label">Passengers</div>
                  <div className="value">
                    {passengerCount}{" "}
                    {passengerCount === 1 ? "Passenger" : "Passengers"}
                  </div>
                </div>
                <div>
                  <div className="label">Total Amount</div>
                  <div className="value price">₹{displayAmount.toFixed(2)}</div>
                </div>
              </BookingDetails>
            </PassengerSection>

            <BarcodeSection>
              <Barcode>
                <div className="barcode">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="bar"
                      style={{ height: `${10 + Math.random() * 30}px` }}
                    />
                  ))}
                </div>
                <div className="barcode-number">
                  {String(displayBookingId).replace(/[^0-9A-Z]/g, "").substring(0, 10)}
                </div>
              </Barcode>
              <Terms>
                <p>
                  Please arrive at the airport at least 2 hours before
                  departure. Boarding closes 30 minutes before departure.
                </p>
                <p>
                  This is an electronic ticket. No physical ticket is required
                  for check-in.
                </p>
              </Terms>
            </BarcodeSection>
          </TicketBody>

          <TicketFooter>
            <div>Thank you for choosing {flight.airline || "FlightBook"}!</div>
            <div>
              For assistance, please contact our customer service at support@flightbook.com
            </div>
          </TicketFooter>
        </Ticket>
      </TicketContainer>

      <NextSteps>
        <h3>What's Next?</h3>
        <Steps>
          <Step>
            <div className="number">1</div>
            <div>
              <h4>Check Your Email</h4>
              <p>
                We've sent a confirmation email to {contactInfo.email} with your
                e-ticket and booking details.
              </p>
            </div>
          </Step>
          <Step>
            <div className="number">2</div>
            <div>
              <h4>Download or Print Your Ticket</h4>
              <p>
                You can download or print your e-ticket from the buttons above.
                You'll need to show it at the airport.
              </p>
            </div>
          </Step>
          <Step>
            <div className="number">3</div>
            <div>
              <h4>Check-in Online</h4>
              <p>
                Online check-in opens 24 hours before departure. Have your
                passport and booking reference ready.
              </p>
            </div>
          </Step>
        </Steps>
      </NextSteps>
    </Container>
  );
};

// Styled Components
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  font-size: 1.2rem;
  color: #555;
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
  background: #fff8f8;
  border: 1px solid #ffcccc;
  border-radius: 8px;

  h2 {
    color: #d32f2f;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
    color: #666;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ConfirmationHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
    margin: 1rem 0 0.5rem;
    font-size: 2rem;
  }

  p {
    color: ${({ theme }) => theme.colors.gray};
    margin: 0;
  }
`;

const Checkmark = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8f5e9;
  color: #4caf50;
  font-size: 3rem;
`;

const BookingReference = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};
  display: inline-block;
  font-size: 1.1rem;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid
    ${({ theme, primary }) =>
      primary ? theme.colors.primary : theme.colors.grayLight};
  background: ${({ theme, primary }) =>
    primary ? theme.colors.primary : "white"};
  color: ${({ theme, primary }) => (primary ? "white" : theme.colors.grayDark)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, primary }) =>
      primary ? theme.colors.primaryDark : theme.colors.grayLighter};
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;

const TicketContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  margin: 2rem 0;
`;

const Ticket = styled.div`
  font-family: Arial, sans-serif;
  color: #333;
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const Status = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ status }) =>
    status === "confirmed"
      ? "#4caf50"
      : status === "pending"
      ? "#ff9800"
      : "#f44336"};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AirlineLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;

  svg {
    font-size: 1.5rem;
  }
`;

const TicketBody = styled.div`
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const FlightSection = styled.div`
  margin-bottom: 2.5rem;
`;

const FlightRoute = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .departure,
  .arrival {
    text-align: center;
    flex: 1;

    .time {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .date {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
      margin-bottom: 0.5rem;
    }

    .airport {
      font-size: 1.125rem;
      font-weight: 600;
    }
  }
`;

const FlightDuration = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 2;
  padding: 0 1rem;

  .line {
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.colors.grayLight};
    position: relative;
    margin: 0.5rem 0;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-top: 2px solid ${({ theme }) => theme.colors.grayLight};
      border-right: 2px solid ${({ theme }) => theme.colors.grayLight};
      transform: rotate(45deg);
    }

    &::after {
      content: "";
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-top: 2px solid ${({ theme }) => theme.colors.grayLight};
      border-right: 2px solid ${({ theme }) => theme.colors.grayLight};
      transform: rotate(225deg);
    }
  }

  .duration {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};
    margin: 0.25rem 0;
  }

  .stops {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.gray};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const FlightMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;

    svg {
      color: ${({ theme }) => theme.colors.gray};
    }
  }
`;

const PassengerSection = styled.div`
  margin-bottom: 2.5rem;
`;

const PassengerInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  .label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1rem;
    font-weight: 500;
  }
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};

  .label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1rem;
    font-weight: 500;

    &.price {
      color: ${({ theme }) => theme.colors.primary};
      font-size: 1.25rem;
      font-weight: 600;
    }
  }
`;

const BarcodeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px dashed ${({ theme }) => theme.colors.grayLight};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }
`;

const Barcode = styled.div`
  .barcode {
    display: flex;
    gap: 2px;
    height: 40px;
    margin-bottom: 0.5rem;

    .bar {
      width: 2px;
      height: 100%;
      background: #333;
    }
  }

  .barcode-number {
    font-family: "Libre Barcode 39", monospace;
    font-size: 2rem;
    letter-spacing: 2px;
    text-align: center;
  }
`;

const Terms = styled.div`
  max-width: 400px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray};
  line-height: 1.5;

  p {
    margin: 0 0 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const TicketFooter = styled.div`
  padding: 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray};

  div:first-child {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
`;

const NextSteps = styled.div`
  margin: 3rem 0;

  h3 {
    text-align: center;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const Step = styled.div`
  display: flex;
  gap: 1rem;

  .number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    font-weight: 600;
    flex-shrink: 0;
  }

  h4 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 0.9375rem;
    line-height: 1.5;
  }
`;

export default BookingConfirmationPage;
