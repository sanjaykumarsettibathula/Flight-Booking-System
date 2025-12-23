import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  FaPlane,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaTicketAlt,
  FaTimesCircle,
  FaDownload,
} from "react-icons/fa";
import { useGetBookingsQuery, useCancelBookingMutation, useDownloadTicketMutation } from "../../features/bookings/bookingSlice";
import { toast } from "react-toastify";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: bookingsResponse, isLoading, error, refetch } = useGetBookingsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [cancelBooking] = useCancelBookingMutation();
  const [downloadTicket] = useDownloadTicketMutation();

  const bookings = bookingsResponse?.data || [];

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await cancelBooking(bookingId).unwrap();
      toast.success("Booking cancelled successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to cancel booking");
    }
  };

  const handleDownloadTicket = async (bookingId) => {
    try {
      await downloadTicket(bookingId).unwrap();
      toast.success("Ticket download started");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to download ticket");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <EmptyState>
          <h2>Please sign in to view your bookings</h2>
          <button onClick={() => navigate("/login")}>Sign In</button>
        </EmptyState>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading your bookings...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h2>Error loading bookings</h2>
          <p>{error?.data?.message || "Failed to load bookings. Please try again."}</p>
          <button onClick={() => refetch()}>Retry</button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>My Bookings</h1>
        <p>View and manage all your flight bookings</p>
      </Header>

      {bookings.length === 0 ? (
        <EmptyState>
          <FaTicketAlt size={64} />
          <h2>No bookings found</h2>
          <p>You haven't made any bookings yet. Start by searching for flights!</p>
          <button onClick={() => navigate("/flights")}>Search Flights</button>
        </EmptyState>
      ) : (
        <BookingsList>
          {bookings.map((booking) => (
            <BookingCard key={booking._id}>
              <BookingHeader>
                <div>
                  <BookingId>
                    <FaTicketAlt /> PNR: {booking.pnr}
                  </BookingId>
                  <StatusBadge status={booking.status}>
                    {booking.status.toUpperCase()}
                  </StatusBadge>
                </div>
                <BookingDate>
                  <FaCalendarAlt /> Booked on {formatDate(booking.bookingDate)}
                </BookingDate>
              </BookingHeader>

              {booking.flight && (
                <FlightDetails>
                  <Route>
                    <div className="departure">
                      <div className="time">{formatTime(booking.flight.departureTime)}</div>
                      <div className="city">{booking.flight.departureCity}</div>
                      <div className="date">{formatDate(booking.flight.departureTime)}</div>
                    </div>
                    <div className="arrow">
                      <FaPlane />
                    </div>
                    <div className="arrival">
                      <div className="time">{formatTime(booking.flight.arrivalTime)}</div>
                      <div className="city">{booking.flight.arrivalCity}</div>
                      <div className="date">{formatDate(booking.flight.arrivalTime)}</div>
                    </div>
                  </Route>

                  <FlightInfo>
                    <div>
                      <strong>{booking.flight.airline}</strong> {booking.flight.flightNumber}
                    </div>
                    <div>
                      Seat: <strong>{booking.seatNumber}</strong>
                    </div>
                    <div>
                      Passenger: <strong>{booking.passengerName}</strong>
                    </div>
                  </FlightInfo>
                </FlightDetails>
              )}

              <BookingFooter>
                <Amount>
                  <FaRupeeSign /> {booking.amountPaid}
                </Amount>
                <Actions>
                  {booking.status === "confirmed" && (
                    <>
                      <ActionButton onClick={() => handleDownloadTicket(booking._id)}>
                        <FaDownload /> Download Ticket
                      </ActionButton>
                      <ActionButton
                        danger
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        <FaTimesCircle /> Cancel
                      </ActionButton>
                    </>
                  )}
                  <ActionButton onClick={() => navigate(`/bookings/${booking._id}`)}>
                    View Details
                  </ActionButton>
                </Actions>
              </BookingFooter>
            </BookingCard>
          ))}
        </BookingsList>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.black};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};

  svg {
    color: ${({ theme }) => theme.colors.grayLight};
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.black};
  }

  p {
    margin: 0 0 1.5rem;
    color: ${({ theme }) => theme.colors.gray};
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

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BookingCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BookingId = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 0.5rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ status }) => {
    switch (status) {
      case "confirmed":
        return "#e8f5e9";
      case "cancelled":
        return "#ffebee";
      case "pending":
        return "#fff3e0";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case "confirmed":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#757575";
    }
  }};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BookingDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray};

  svg {
    color: ${({ theme }) => theme.colors.grayLight};
  }
`;

const FlightDetails = styled.div`
  margin-bottom: 1.5rem;
`;

const Route = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  .departure,
  .arrival {
    flex: 1;

    .time {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.black};
      margin-bottom: 0.25rem;
    }

    .city {
      font-size: 1rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.grayDark};
      margin-bottom: 0.25rem;
    }

    .date {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
    }
  }

  .arrow {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
  }
`;

const FlightInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grayDark};

  strong {
    color: ${({ theme }) => theme.colors.black};
  }
`;

const BookingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Amount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  svg {
    font-size: 1.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme, danger }) =>
    danger ? theme.colors.danger : theme.colors.white};
  color: ${({ theme, danger }) =>
    danger ? theme.colors.white : theme.colors.primary};
  border: 1px solid
    ${({ theme, danger }) =>
      danger ? theme.colors.danger : theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme, danger }) =>
      danger ? theme.colors.dangerDark : theme.colors.primary};
    color: white;
  }

  svg {
    font-size: 0.875rem;
  }
`;

export default MyBookingsPage;
