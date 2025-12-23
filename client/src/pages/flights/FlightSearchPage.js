import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch, FaExchangeAlt, FaUser, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt } from 'react-icons/fa';
import { searchFlights, clearSearchResults } from '../../features/flights/flightSlice';

const FlightSearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, loading, error } = useSelector((state) => state.flights);
  
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    departureDate: new Date(),
    returnDate: null,
    passengers: 1,
    tripType: 'oneway',
  });

  const { departure, arrival, departureDate, returnDate, passengers, tripType } = formData;

  // Indian cities for autocomplete
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Goa'
  ];

  useEffect(() => {
    // Clear previous search results when component unmounts
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  const handleSwapCities = () => {
    setFormData({
      ...formData,
      departure: arrival,
      arrival: departure,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!departure || !arrival) {
      alert('Please select departure and arrival cities');
      return;
    }

    if (departure === arrival) {
      alert('Departure and arrival cities cannot be the same');
      return;
    }

    const searchParams = {
      departure,
      arrival,
      date: departureDate.toISOString().split('T')[0],
      passengers,
      tripType,
    };

    if (tripType === 'roundtrip' && returnDate) {
      searchParams.returnDate = returnDate.toISOString().split('T')[0];
    }

    dispatch(searchFlights(searchParams));
  };

  const handleFlightSelect = (flightId) => {
    navigate(`/flights/${flightId}`, {
      state: {
        passengers,
        tripType,
        returnDate: returnDate ? returnDate.toISOString().split('T')[0] : null,
      },
    });
  };

  return (
    <SearchContainer>
      <SearchForm onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <label>From</label>
            <div className="input-with-icon">
              <FaPlaneDeparture className="icon" />
              <select
                name="departure"
                value={departure}
                onChange={handleChange}
                required
              >
                <option value="">Select departure city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </FormGroup>

          <SwapButton type="button" onClick={handleSwapCities}>
            <FaExchangeAlt />
          </SwapButton>

          <FormGroup>
            <label>To</label>
            <div className="input-with-icon">
              <FaPlaneArrival className="icon" />
              <select
                name="arrival"
                value={arrival}
                onChange={handleChange}
                required
              >
                <option value="">Select arrival city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <label>Departure Date</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="icon" />
              <DatePicker
                selected={departureDate}
                onChange={(date) => handleDateChange(date, 'departureDate')}
                minDate={new Date()}
                dateFormat="EEE, MMM d, yyyy"
                className="date-picker"
                required
              />
            </div>
          </FormGroup>

          <FormGroup>
            <label>Trip Type</label>
            <div className="trip-type">
              <label>
                <input
                  type="radio"
                  name="tripType"
                  value="oneway"
                  checked={tripType === 'oneway'}
                  onChange={handleChange}
                />
                One Way
              </label>
              <label>
                <input
                  type="radio"
                  name="tripType"
                  value="roundtrip"
                  checked={tripType === 'roundtrip'}
                  onChange={handleChange}
                />
                Round Trip
              </label>
            </div>
          </FormGroup>
        </FormRow>

        {tripType === 'roundtrip' && (
          <FormRow>
            <FormGroup>
              <label>Return Date</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="icon" />
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => handleDateChange(date, 'returnDate')}
                  minDate={departureDate || new Date()}
                  dateFormat="EEE, MMM d, yyyy"
                  className="date-picker"
                  required={tripType === 'roundtrip'}
                />
              </div>
            </FormGroup>

            <FormGroup>
              <label>Passengers</label>
              <div className="input-with-icon">
                <FaUser className="icon" />
                <select
                  name="passengers"
                  value={passengers}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            </FormGroup>
          </FormRow>
        )}

        <SearchButton type="submit" disabled={loading}>
          <FaSearch /> {loading ? 'Searching...' : 'Search Flights'}
        </SearchButton>
      </SearchForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {searchResults && searchResults.length > 0 && (
        <ResultsContainer>
          <ResultsHeader>
            <h3>Available Flights</h3>
            <p>{searchResults.length} flights found</p>
          </ResultsHeader>

          <FlightList>
            {searchResults.map((flight) => {
              const flightId = flight._id || flight.id;
              const formatTime = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              };
              const getDuration = (dep, arr) => {
                if (!dep || !arr) return 'N/A';
                const diff = new Date(arr) - new Date(dep);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}h ${minutes}m`;
              };
              return (
                <FlightCard key={flightId} onClick={() => handleFlightSelect(flightId)}>
                  <FlightHeader>
                    <Airline>{flight.airline}</Airline>
                    <FlightNumber>{flight.flightNumber}</FlightNumber>
                  </FlightHeader>
                  
                  <FlightDetails>
                    <div className="time">
                      <div className="departure">
                        <span className="time">{formatTime(flight.departureTime)}</span>
                        <span className="city">{flight.departureCity}</span>
                      </div>
                      
                      <div className="duration">
                        <div className="line" />
                        <span>{getDuration(flight.departureTime, flight.arrivalTime)}</span>
                      </div>
                      
                      <div className="arrival">
                        <span className="time">{formatTime(flight.arrivalTime)}</span>
                        <span className="city">{flight.arrivalCity}</span>
                      </div>
                    </div>
                    
                    <div className="price">
                      <span className="amount">₹{flight.currentPrice || flight.basePrice || 0}</span>
                      <span className="per-person">per person</span>
                      <button className="select-btn">Select</button>
                    </div>
                  </FlightDetails>
                  
                  {flight.isCheapest && <Ribbon>Cheapest</Ribbon>}
                  {flight.isFastest && <Ribbon variant="fastest">Fastest</Ribbon>}
                </FlightCard>
              );
            })}
          </FlightList>
        </ResultsContainer>
      )}
      
      {searchResults && searchResults.length === 0 && !loading && (
        <NoResults>
          <h4>No flights found</h4>
          <p>Try adjusting your search criteria</p>
        </NoResults>
      )}
    </SearchContainer>
  );
};

// Styled Components
const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SearchForm = styled.form`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.grayDark};
  }
  
  .input-with-icon {
    position: relative;
    
    .icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: ${({ theme }) => theme.colors.gray};
    }
    
    select, .date-picker {
      width: 100%;
      padding: 0.625rem 1rem 0.625rem 2.5rem;
      border: 1px solid ${({ theme }) => theme.colors.grayLight};
      border-radius: ${({ theme }) => theme.radii.md};
      font-size: 1rem;
      appearance: none;
      background-color: white;
      
      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
      }
    }
    
    .date-picker {
      cursor: pointer;
    }
  }
  
  .trip-type {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      margin: 0;
      
      input[type="radio"] {
        margin: 0;
      }
    }
  }
`;

const SwapButton = styled.button`
  background: ${({ theme }) => theme.colors.grayLighter};
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 0.5rem 0.5rem;
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    background: ${({ theme }) => theme.colors.grayLight};
  }
  
  @media (max-width: 768px) {
    margin: 0.5rem auto;
  }
`;

const SearchButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.grayLight};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.dangerLight};
  color: ${({ theme }) => theme.colors.danger};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray};
  }
`;

const FlightList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const FlightCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const FlightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};
`;

const Airline = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
`;

const FlightNumber = styled.div`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 0.875rem;
`;

const FlightDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .time {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    
    .departure, .arrival {
      display: flex;
      flex-direction: column;
      
      .time {
        font-size: 1.5rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.black};
      }
      
      .city {
        font-size: 0.875rem;
        color: ${({ theme }) => theme.colors.gray};
      }
    }
    
    .duration {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: ${({ theme }) => theme.colors.gray};
      font-size: 0.75rem;
      min-width: 120px;
      
      .line {
        width: 100%;
        height: 1px;
        background: ${({ theme }) => theme.colors.grayLight};
        position: relative;
        margin: 0.5rem 0;
        
        &::before {
          content: '';
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
    }
  }
  
  .price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    
    .amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.primary};
    }
    
    .per-person {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.gray};
      margin-bottom: 0.5rem;
    }
    
    .select-btn {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${({ theme }) => theme.radii.md};
      padding: 0.5rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: ${({ theme }) => theme.transitions.default};
      
      &:hover {
        background: ${({ theme }) => theme.colors.primaryDark};
      }
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    
    .price {
      width: 100%;
      align-items: stretch;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};
      
      .select-btn {
        width: 100%;
        padding: 0.75rem;
      }
    }
  }
`;

const Ribbon = styled.div`
  position: absolute;
  top: 1rem;
  right: -2rem;
  background: ${({ theme, variant }) => 
    variant === 'fastest' ? theme.colors.secondary : theme.colors.primary};
  color: white;
  padding: 0.25rem 2rem;
  transform: rotate(45deg);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  h4 {
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.black};
  }
  
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray};
  }
`;

export default FlightSearchPage;
