import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  FaPlane,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaUser,
  FaCog,
} from "react-icons/fa";

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data - in a real app, this would come from an API
  const mockBookings = [
    {
      id: "BK123456",
      flight: {
        airline: "SkyWings Airlines",
        flightNumber: "SW456",
        departureCity: "New York (JFK)",
        arrivalCity: "Los Angeles (LAX)",
        departureTime: "09:30",
        departureDate: "2025-12-25",
        duration: "3h 15m",
      },
      passengers: 2,
      totalAmount: 498.0,
      status: "confirmed",
      bookingDate: "2025-12-20T14:30:00Z",
    },
    {
      id: "BK789012",
      flight: {
        airline: "Oceanic Airlines",
        flightNumber: "OA789",
        departureCity: "Los Angeles (LAX)",
        arrivalCity: "New York (JFK)",
        departureTime: "15:45",
        departureDate: "2026-01-05",
        duration: "3h 30m",
      },
      passengers: 2,
      totalAmount: 525.5,
      status: "upcoming",
      bookingDate: "2025-12-15T10:15:00Z",
    },
    {
      id: "BK345678",
      flight: {
        airline: "Global Airways",
        flightNumber: "GA123",
        departureCity: "Chicago (ORD)",
        arrivalCity: "Miami (MIA)",
        departureTime: "11:15",
        departureDate: "2025-11-15",
        duration: "2h 45m",
      },
      passengers: 1,
      totalAmount: 275.75,
      status: "completed",
      bookingDate: "2025-11-01T09:45:00Z",
    },
  ];

  const [bookings, setBookings] = useState(mockBookings);
  const [walletBalance, setWalletBalance] = useState(3250.75);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return booking.status === "upcoming" || booking.status === "confirmed";
    } else if (activeTab === "past") {
      return booking.status === "completed" || booking.status === "cancelled";
    }
    return true;
  });

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        text: "Confirmed",
        color: "#4caf50",
        icon: <FaCheckCircle />,
      },
      upcoming: { text: "Upcoming", color: "#2196f3", icon: <FaClock /> },
      completed: {
        text: "Completed",
        color: "#9e9e9e",
        icon: <FaCheckCircle />,
      },
      cancelled: {
        text: "Cancelled",
        color: "#f44336",
        icon: <FaTimesCircle />,
      },
    };

    const config = statusConfig[status] || { text: status, color: "#9e9e9e" };

    return (
      <StatusBadge color={config.color}>
        {config.icon}
        <span>{config.text}</span>
      </StatusBadge>
    );
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Welcome back, {user?.name || "Guest"}</h1>
        <p>Here's what's happening with your bookings</p>
      </DashboardHeader>

      <DashboardContent>
        <Sidebar>
          <ProfileCard>
            <Avatar>
              <FaUser />
            </Avatar>
            <ProfileInfo>
              <h3>{user?.name || "Guest User"}</h3>
              <p>{user?.email || "guest@example.com"}</p>
              <EditProfileLink to="/profile">
                <FaCog /> Edit Profile
              </EditProfileLink>
            </ProfileInfo>
          </ProfileCard>

          <WalletCard>
            <WalletHeader>
              <FaWallet />
              <h4>My Wallet</h4>
            </WalletHeader>
            <WalletBalance>${walletBalance.toFixed(2)}</WalletBalance>
            <WalletActions>
              <WalletButton>Add Funds</WalletButton>
              <WalletButton outline>Withdraw</WalletButton>
            </WalletActions>
          </WalletCard>

          <NavMenu>
            <NavItem
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
            >
              <FaPlane /> Upcoming Trips
            </NavItem>
            <NavItem
              active={activeTab === "past"}
              onClick={() => setActiveTab("past")}
            >
              <FaClock /> Past Trips
            </NavItem>
          </NavMenu>
        </Sidebar>

        <MainContent>
          <ContentHeader>
            <h2>
              {activeTab === "upcoming" ? "Upcoming Trips" : "Travel History"}
            </h2>
            <SearchBar>
              <input type="text" placeholder="Search bookings..." />
              <button>Search</button>
            </SearchBar>
          </ContentHeader>

          {filteredBookings.length > 0 ? (
            <BookingsList>
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id}>
                  <BookingHeader>
                    <div>
                      <h3>{booking.flight.airline}</h3>
                      <FlightNumber>{booking.flight.flightNumber}</FlightNumber>
                    </div>
                    <div>
                      <BookingId>#{booking.id}</BookingId>
                      {getStatusBadge(booking.status)}
                    </div>
                  </BookingHeader>

                  <FlightRoute>
                    <div className="departure">
                      <div className="time">{booking.flight.departureTime}</div>
                      <div className="city">{booking.flight.departureCity}</div>
                      <div className="date">
                        {new Date(
                          booking.flight.departureDate
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="duration">
                      <div className="line" />
                      <div className="stops">Non-stop</div>
                      <div className="duration-text">
                        {booking.flight.duration}
                      </div>
                    </div>

                    <div className="arrival">
                      <div className="time">
                        {new Date(
                          `2000-01-01T${booking.flight.departureTime}`
                        ).getTime() +
                          parseInt(booking.flight.duration) * 60000}
                      </div>
                      <div className="city">{booking.flight.arrivalCity}</div>
                      <div className="date">
                        {new Date(
                          booking.flight.departureDate
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </FlightRoute>

                  <BookingFooter>
                    <div className="passengers">
                      <span>
                        {booking.passengers}{" "}
                        {booking.passengers === 1 ? "Passenger" : "Passengers"}
                      </span>
                      <span className="divider">•</span>
                      <span>${booking.totalAmount.toFixed(2)}</span>
                    </div>

                    <BookingActions>
                      <ActionButton>View Details</ActionButton>
                      {booking.status === "upcoming" && (
                        <ActionButton secondary>Check-in</ActionButton>
                      )}
                      {booking.status === "confirmed" && (
                        <ActionButton secondary>Download Ticket</ActionButton>
                      )}
                    </BookingActions>
                  </BookingFooter>
                </BookingCard>
              ))}
            </BookingsList>
          ) : (
            <NoBookings>
              <FaPlane />
              <h3>
                No {activeTab === "upcoming" ? "upcoming" : "past"} trips found
              </h3>
              <p>Ready to plan your next adventure?</p>
              <SearchFlightsLink to="/flights">
                Search Flights
              </SearchFlightsLink>
            </NoBookings>
          )}

          <QuickActions>
            <QuickActionCard>
              <h4>Need Help?</h4>
              <p>
                24/7 customer support is available for all your travel needs.
              </p>
              <ActionButton>Contact Support</ActionButton>
            </QuickActionCard>

            <QuickActionCard>
              <h4>Earn Rewards</h4>
              <p>Join our loyalty program and earn points on every booking.</p>
              <ActionButton>Learn More</ActionButton>
            </QuickActionCard>
          </QuickActions>
        </MainContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2.5rem;

  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.black};
    margin: 0 0 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.gray};
    margin: 0;
    font-size: 1.1rem;
  }
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 1.5rem;
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
`;

const ProfileInfo = styled.div`
  h3 {
    margin: 0 0 0.25rem;
    font-size: 1.25rem;
  }

  p {
    margin: 0 0 1rem;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 0.875rem;
  }
`;

const EditProfileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  svg {
    font-size: 0.875rem;
  }
`;

const WalletCard = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: white;
  padding: 1.5rem;
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  h4 {
    margin: 0;
    font-size: 1rem;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const WalletBalance = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const WalletActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const WalletButton = styled.button`
  background: ${({ outline, theme }) =>
    outline ? "transparent" : "rgba(255, 255, 255, 0.2)"};
  border: ${({ outline, theme }) =>
    outline ? "1px solid rgba(255, 255, 255, 0.5)" : "none"};
  color: white;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NavMenu = styled.nav`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.grayDark};
  background: ${({ active, theme }) =>
    active ? theme.colors.primaryLight : "transparent"};
  font-weight: ${({ active }) => (active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid
    ${({ active, theme }) => (active ? theme.colors.primary : "transparent")};

  &:hover {
    background: ${({ theme }) => theme.colors.grayLighter};
  }

  svg {
    font-size: 1rem;
  }
`;

const MainContent = styled.main`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 2rem;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.black};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SearchBar = styled.div`
  display: flex;

  input {
    padding: 0.5rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.grayLight};
    border-radius: ${({ theme }) => theme.radii.md} 0 0
      ${({ theme }) => theme.radii.md};
    font-size: 0.875rem;
    min-width: 250px;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 0 ${({ theme }) => theme.radii.md}
      ${({ theme }) => theme.radii.md} 0;
    padding: 0 1.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }
  }
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const BookingCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};

  h3 {
    margin: 0;
    font-size: 1.125rem;
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const FlightNumber = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray};
  margin-left: 0.5rem;
`;

const BookingId = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray};
  margin-right: 1rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  font-size: 0.75rem;
  font-weight: 600;

  svg {
    font-size: 0.75rem;
  }
`;

const FlightRoute = styled.div`
  display: flex;
  padding: 1.5rem;

  .departure,
  .arrival {
    flex: 1;

    .time {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .city {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .date {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
    }
  }

  .duration {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;

    .line {
      width: 100%;
      height: 1px;
      background: ${({ theme }) => theme.colors.grayLight};
      position: relative;
      margin: 0.5rem 0;

      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-top: 2px solid ${({ theme }) => theme.colors.grayLight};
        border-right: 2px solid ${({ theme }) => theme.colors.grayLight};
      }

      &::before {
        left: 0;
        transform: translateY(-50%) rotate(-135deg);
      }

      &::after {
        right: 0;
        transform: translateY(-50%) rotate(45deg);
      }
    }

    .stops {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0.25rem 0;
    }

    .duration-text {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;

    .duration {
      flex-direction: row;
      padding: 1rem 0;

      .line {
        width: 100%;
        height: 1px;
        margin: 0 1rem;

        &::before,
        &::after {
          display: none;
        }
      }

      .stops,
      .duration-text {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        padding: 0 0.5rem;
      }

      .stops {
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .duration-text {
        right: 1rem;
      }
    }
  }
`;

const BookingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};

  .passengers {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};

    .divider {
      opacity: 0.5;
    }

    span:first-child {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.grayDark};
    }
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const BookingActions = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 576px) {
    width: 100%;

    button {
      flex: 1;
      text-align: center;
    }
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1.25rem;
  border: 1px solid
    ${({ theme, secondary }) =>
      secondary ? theme.colors.grayLight : theme.colors.primary};
  background: ${({ theme, secondary }) =>
    secondary ? "white" : theme.colors.primary};
  color: ${({ theme, secondary }) =>
    secondary ? theme.colors.grayDark : "white"};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, secondary }) =>
      secondary ? theme.colors.grayLighter : theme.colors.primaryDark};
  }
`;

const NoBookings = styled.div`
  text-align: center;
  padding: 3rem 2rem;

  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.grayLight};
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.black};
  }

  p {
    margin: 0 0 1.5rem;
    color: ${({ theme }) => theme.colors.gray};
  }
`;

const SearchFlightsLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.radii.md};
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
`;

const QuickActionCard = styled.div`
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;

  h4 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
  }

  p {
    margin: 0 0 1.25rem;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  ${ActionButton} {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }
`;

export default UserDashboard;
