import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  useGetWalletQuery,
  selectWalletBalance,
  selectWalletTransactions,
} from "../features/wallet/walletSlice";
import { useGetFlightsQuery } from "../features/flights/flightSlice";

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Wallet data
  useGetWalletQuery(undefined, { skip: !isAuthenticated });
  const balance = useSelector(selectWalletBalance);
  const transactions = useSelector(selectWalletTransactions);

  const latestTransaction =
    transactions && transactions.length > 0
      ? transactions[transactions.length - 1]
      : null;

  // Flight data from MongoDB-backed API
  const { data: flightsResponse, isLoading: flightsLoading } =
    useGetFlightsQuery("");
  const flights = flightsResponse?.data || [];

  // Local filters for the "Search & Filter Flights" section
  const defaultFilters = {
    departure: "all",
    arrival: "all",
    airline: "all",
    sortBy: "price_asc",
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const formatTime = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return "--";
    const diffMs = new Date(arrivalTime) - new Date(departureTime);
    const totalMinutes = Math.max(0, Math.round(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const filteredFlights = useMemo(() => {
    return (
      flights
        // Filter by cities and airline
        .filter((flight) => {
          if (
            appliedFilters.departure !== "all" &&
            flight.departureCity !== appliedFilters.departure
          ) {
            return false;
          }
          if (
            appliedFilters.arrival !== "all" &&
            flight.arrivalCity !== appliedFilters.arrival
          ) {
            return false;
          }
          if (
            appliedFilters.airline !== "all" &&
            flight.airline !== appliedFilters.airline
          ) {
            return false;
          }
          return true;
        })
        // Sort by selected criteria
        .sort((a, b) => {
          const priceA = a.currentPrice || a.basePrice || 0;
          const priceB = b.currentPrice || b.basePrice || 0;
          const depA = new Date(a.departureTime).getTime();
          const depB = new Date(b.departureTime).getTime();
          const durA = new Date(a.arrivalTime) - new Date(a.departureTime);
          const durB = new Date(b.arrivalTime) - new Date(b.departureTime);

          switch (appliedFilters.sortBy) {
            case "price_desc":
              return priceB - priceA;
            case "departure":
              return depA - depB;
            case "duration":
              return durA - durB;
            case "price_asc":
            default:
              return priceA - priceB;
          }
        })
    );
  }, [flights, appliedFilters]);

  return (
    <PageBackground>
      <Container>
        <HeaderSection>
          <Title>Find Your Perfect Flight</Title>
          <Subtitle>Search and book flights with ease</Subtitle>
        </HeaderSection>

        <WalletAndActions>
          <WalletCard>
            <WalletHeader>
              <WalletLabel>Wallet Balance</WalletLabel>
              {!isAuthenticated && (
                <WalletHint>Sign in to sync your wallet</WalletHint>
              )}
            </WalletHeader>
            <WalletAmount>₹{Number(balance).toLocaleString()}</WalletAmount>

            {latestTransaction && (
              <RecentActivity>
                <RecentTitle>Recent Activity</RecentTitle>
                <RecentRow>
                  <span>
                    {latestTransaction.description || "Recent transaction"}
                  </span>
                  <RecentAmount type={latestTransaction.type}>
                    {latestTransaction.type === "debit" ? "-" : "+"}₹
                    {Number(latestTransaction.amount).toLocaleString()}
                  </RecentAmount>
                </RecentRow>
              </RecentActivity>
            )}
          </WalletCard>

          <ActionsCard>
            <ActionsTitle>Ready to go somewhere?</ActionsTitle>
            <ActionsSubtitle>
              Start by exploring flights or viewing your existing bookings.
            </ActionsSubtitle>
            <ActionsButtons>
              <PrimaryButton as={Link} to="/flights">
                Search Flights
              </PrimaryButton>
              <SecondaryButton
                as={Link}
                to={isAuthenticated ? "/my-bookings" : "/login"}
              >
                {isAuthenticated ? "My Bookings" : "Sign In"}
              </SecondaryButton>
            </ActionsButtons>
          </ActionsCard>
        </WalletAndActions>

        {/* Search & Filter Flights */}
        <FiltersCard>
          <FiltersHeader>
            <FiltersTitle>Search & Filter Flights</FiltersTitle>
            <FiltersSubtitle>
              Narrow down flights by city, airline, or sort by price and time.
            </FiltersSubtitle>
          </FiltersHeader>

          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>From</FilterLabel>
              <FilterSelect
                value={filters.departure}
                onChange={(e) =>
                  handleFilterChange("departure", e.target.value)
                }
              >
                <option value="all">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Hyderabad">Hyderabad</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>To</FilterLabel>
              <FilterSelect
                value={filters.arrival}
                onChange={(e) => handleFilterChange("arrival", e.target.value)}
              >
                <option value="all">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Hyderabad">Hyderabad</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Airline</FilterLabel>
              <FilterSelect
                value={filters.airline}
                onChange={(e) => handleFilterChange("airline", e.target.value)}
              >
                <option value="all">All Airlines</option>
                <option value="Air India">Air India</option>
                <option value="IndiGo">IndiGo</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Vistara">Vistara</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Sort By</FilterLabel>
              <FilterSelect
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="departure">Departure Time</option>
                <option value="duration">Duration</option>
              </FilterSelect>
            </FilterGroup>

            <FiltersActions>
              <PrimaryButton type="button" onClick={handleSearch}>
                Search
              </PrimaryButton>
              <SecondaryButton type="button" onClick={handleClearFilters}>
                Clear
              </SecondaryButton>
            </FiltersActions>
          </FiltersGrid>
        </FiltersCard>

        {/* Flight Results */}
        <FlightsSection>
          <FlightsHeader>
            <FlightsTitle>
              Available Flights ({filteredFlights.length})
            </FlightsTitle>
          </FlightsHeader>

          {flightsLoading ? (
            <FlightsEmpty>Loading flights from the server...</FlightsEmpty>
          ) : filteredFlights.length === 0 ? (
            <FlightsEmpty>
              No flights found. Try adjusting your filters or adding data to
              MongoDB.
            </FlightsEmpty>
          ) : (
            <FlightsList>
              {filteredFlights.map((flight) => (
                <FlightCard key={flight._id}>
                  <FlightMain>
                    <FlightRoute>
                      <FlightTimeBlock>
                        <FlightTime>{formatTime(flight.departureTime)}</FlightTime>
                        <FlightCity>{flight.departureCity}</FlightCity>
                        <FlightDate>{formatDate(flight.departureTime)}</FlightDate>
                      </FlightTimeBlock>

                      <FlightDuration>
                        <DurationLine />
                        <DurationText>
                          {getDuration(
                            flight.departureTime,
                            flight.arrivalTime
                          )}
                        </DurationText>
                      </FlightDuration>

                      <FlightTimeBlock align="right">
                        <FlightTime>{formatTime(flight.arrivalTime)}</FlightTime>
                        <FlightCity>{flight.arrivalCity}</FlightCity>
                        <FlightDate>{formatDate(flight.arrivalTime)}</FlightDate>
                      </FlightTimeBlock>
                    </FlightRoute>

                    <FlightMeta>
                      <FlightAirline>{flight.airline}</FlightAirline>
                      <FlightNumber>{flight.flightNumber}</FlightNumber>
                    </FlightMeta>
                  </FlightMain>

                  <FlightPriceBlock>
                    {flight.currentPrice &&
                      flight.basePrice &&
                      flight.currentPrice > flight.basePrice && (
                        <OriginalPrice>
                          ₹{Number(flight.basePrice).toLocaleString()}
                        </OriginalPrice>
                      )}
                    <CurrentPrice>
                      ₹{Number(flight.currentPrice || flight.basePrice).toLocaleString()}
                    </CurrentPrice>
                    <SmallText>per passenger</SmallText>
                    <PrimaryButton as={Link} to={`/flights/${flight._id}`}>
                      View Details
                    </PrimaryButton>
                  </FlightPriceBlock>
                </FlightCard>
              ))}
            </FlightsList>
          )}
        </FlightsSection>
      </Container>
    </PageBackground>
  );
};

const PageBackground = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
`;

const HeaderSection = styled.section`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  margin-bottom: 0.75rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray};
`;

const WalletAndActions = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.4fr);
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WalletCard = styled.section`
  background: radial-gradient(circle at top left, #0f172a, #020617);
  color: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 2rem 2.25rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const WalletLabel = styled.p`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(248, 250, 252, 0.7);
`;

const WalletHint = styled.p`
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.7);
`;

const WalletAmount = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
`;

const RecentActivity = styled.div`
  margin-top: 2rem;
  border-top: 1px solid rgba(148, 163, 184, 0.5);
  padding-top: 1rem;
`;

const RecentTitle = styled.p`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.9);
  margin-bottom: 0.5rem;
`;

const RecentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
`;

const RecentAmount = styled.span`
  font-weight: 600;
  color: ${({ type }) =>
    type === "debit" ? "#fca5a5" : type === "credit" ? "#bbf7d0" : "#e5e7eb"};
`;

const ActionsCard = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ActionsTitle = styled.h2`
  margin-bottom: 0.5rem;
`;

const ActionsSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: 1.75rem;
`;

const ActionsButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

// Search & filter section
const FiltersCard = styled.section`
  margin-top: 3rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 1.75rem 2rem;
`;

const FiltersHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const FiltersTitle = styled.h2`
  margin-bottom: 0.25rem;
`;

const FiltersSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 0.9rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayDark};
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.grayLight};
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight}40;
  }
`;

const FiltersActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
`;

// Flights list section
const FlightsSection = styled.section`
  margin-top: 3rem;
`;

const FlightsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FlightsTitle = styled.h2`
  font-size: 1.25rem;
`;

const FlightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FlightsEmpty = styled.p`
  padding: 2.5rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray};
`;

const FlightCard = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1.2fr);
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FlightMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FlightRoute = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: center;
`;

const FlightTimeBlock = styled.div`
  text-align: ${({ align }) => (align === "right" ? "right" : "left")};
`;

const FlightTime = styled.p`
  font-size: 1.4rem;
  font-weight: 600;
`;

const FlightCity = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.grayDark};
`;

const FlightDate = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const FlightDuration = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const DurationLine = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.colors.grayLight};
`;

const DurationText = styled.span`
  font-size: 0.8rem;
`;

const FlightMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const FlightAirline = styled.span`
  font-weight: 600;
`;

const FlightNumber = styled.span`
  color: ${({ theme }) => theme.colors.gray};
`;

const FlightPriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
`;

const OriginalPrice = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.gray};
  text-decoration: line-through;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const SmallText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: 0.5rem;
`;

export default HomePage;
