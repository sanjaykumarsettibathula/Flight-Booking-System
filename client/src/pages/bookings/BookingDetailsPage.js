import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaPlane, FaClock, FaUser, FaTicketAlt, FaPrint, 
  FaEnvelope, FaArrowLeft, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaPlaneDeparture, FaPlaneArrival
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetBookingQuery, useCancelBookingMutation, useDownloadTicketMutation } from '../../features/bookings/bookingSlice';
import { BASE_URL } from '../../config';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { data: bookingResponse, isLoading, error, refetch } = useGetBookingQuery(id);
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [downloadTicket] = useDownloadTicketMutation();
  
  const booking = bookingResponse?.data;
  
  const formatDate = (dateString, formatStr = 'PPPpp') => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'N/A';
    }
  };
  
  const formatDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'N/A';
    try {
      const dep = new Date(departureTime);
      const arr = new Date(arrivalTime);
      const diffMs = arr - dep;
      const totalMinutes = Math.round(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins}m`;
    } catch (e) {
      return 'N/A';
    }
  };
  
  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await cancelBooking(id).unwrap();
        toast.success('Booking cancelled successfully');
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to cancel booking');
      }
    }
  };
  
  const handleDownloadTicket = async () => {
    try {
      await downloadTicket(id).unwrap();
      toast.success('Ticket download started');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to download ticket');
    }
  };
  
  if (isLoading) {
    return <Loading>Loading booking details...</Loading>;
  }
  
  if (error || !booking) {
    return (
      <NotFound>
        <h2>Booking not found</h2>
        <p>{error?.data?.message || 'Unable to load booking details'}</p>
        <button onClick={() => navigate('/my-bookings')}>Back to My Bookings</button>
      </NotFound>
    );
  }
  
  // Format booking data for display
  const flight = booking.flight || {};
  const departureTime = flight.departureTime ? new Date(flight.departureTime) : null;
  const arrivalTime = flight.arrivalTime ? new Date(flight.arrivalTime) : null;
  const flightDuration = formatDuration(flight.departureTime, flight.arrivalTime);
  
  // Create passenger array from booking data
  const passengers = [{
    id: 1,
    name: booking.passengerName,
    type: 'adult',
    seat: booking.seatNumber,
    baggage: '1 x 23kg',
    mealPreference: 'Standard'
  }];
  
  // Format booking data for display
  const bookingData = {
    id: booking._id,
    bookingNumber: booking.pnr,
    status: booking.status,
    bookingDate: booking.bookingDate || booking.createdAt,
    passengers: passengers,
    contactInfo: {
      name: booking.passengerName,
      email: booking.passengerEmail,
      phone: booking.passengerPhone,
      address: 'Not provided'
    },
    payment: {
      method: 'Wallet',
      amount: booking.amountPaid,
      currency: 'INR',
      status: 'paid',
      transactionId: booking.pnr
    },
    flight: {
      id: flight._id,
      airline: flight.airline || 'Unknown',
      flightNumber: flight.flightNumber || 'N/A',
      aircraft: 'Boeing 737-800',
      departure: {
        airport: `${flight.departureCity} Airport`,
        city: flight.departureCity,
        code: flight.departureCity?.substring(0, 3).toUpperCase() || 'N/A',
        terminal: '1',
        gate: 'A12',
        scheduled: flight.departureTime,
        estimated: flight.departureTime,
        status: 'On Time'
      },
      arrival: {
        airport: `${flight.arrivalCity} Airport`,
        city: flight.arrivalCity,
        code: flight.arrivalCity?.substring(0, 3).toUpperCase() || 'N/A',
        terminal: '2',
        baggageClaim: '3',
        scheduled: flight.arrivalTime,
        estimated: flight.arrivalTime,
        status: 'On Time'
      },
      duration: flightDuration,
      cabinClass: 'Economy',
      fareType: 'Standard',
      seats: [booking.seatNumber],
      amenities: ['Entertainment', 'Meal', 'USB Charging'],
      checkInStatus: 'Not Available',
      checkInOpens: flight.departureTime ? new Date(new Date(flight.departureTime).getTime() - 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
      checkInCloses: flight.departureTime ? new Date(new Date(flight.departureTime).getTime() - 30 * 60 * 1000).toISOString() : new Date().toISOString(),
      baggageAllowance: {
        cabin: '1 x 7kg',
        checked: '1 x 23kg'
      },
      fareRules: {
        changes: 'Allowed with fee',
        cancellations: 'Allowed with fee',
        refundable: 'Partially refundable',
        fees: 'Change fee: ₹500, Cancellation fee: ₹1000'
      }
    },
    returnFlight: null,
    addOns: [],
    totalAmount: booking.amountPaid,
    currency: 'INR',
    notes: ['Check-in opens 24 hours before departure', 'Valid photo ID required for check-in']
  };
  
  const totalAddOns = 0;
  const baseFare = bookingData.totalAmount;
  
  const handlePrintTicket = () => {
    window.print();
  };
  
  const handleEmailTicket = () => {
    toast.info('Email functionality would be implemented here');
  };
  
  const handleModifyBooking = () => {
    toast.info('Modification functionality would be implemented here');
  };
  
  const handleCheckIn = () => {
    toast.info('Check-in functionality would be implemented here');
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to My Bookings
        </BackButton>
        <HeaderContent>
          <div>
            <h1>Booking Details</h1>
            <BookingNumber>PNR: {bookingData.bookingNumber}</BookingNumber>
          </div>
          <StatusBadge status={bookingData.status}>
            {bookingData.status === 'confirmed' && <FaCheckCircle />}
            {bookingData.status === 'cancelled' && <FaTimesCircle />}
            {bookingData.status === 'pending' && <FaClock />}
            <span>{bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}</span>
          </StatusBadge>
        </HeaderContent>
      </Header>
      
      <Content>
        <MainContent>
          <Section>
            <SectionHeader>
              <h2><FaPlane /> Flight Details</h2>
              <div className="flight-number">{bookingData.flight.airline} {bookingData.flight.flightNumber}</div>
            </SectionHeader>
            
            <FlightTimeline>
              <div className="departure">
                <div className="time">{departureTime ? departureTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                <div className="date">{departureTime ? formatDate(departureTime) : 'N/A'}</div>
                <div className="airport">{bookingData.flight.departure.airport}</div>
                <div className="terminal">Terminal {bookingData.flight.departure.terminal} • Gate {bookingData.flight.departure.gate}</div>
              </div>
              
              <FlightRoute>
                <div className="duration">
                  <div className="time">{flightDuration}</div>
                  <div className="line" />
                  <div className="stops">Non-stop</div>
                </div>
                <div className="aircraft">
                  <div>Aircraft: {bookingData.flight.aircraft}</div>
                  <div>Class: {bookingData.flight.cabinClass}</div>
                </div>
              </FlightRoute>
              
              <div className="arrival">
                <div className="time">{arrivalTime ? arrivalTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                <div className="date">{arrivalTime ? formatDate(arrivalTime) : 'N/A'}</div>
                <div className="airport">{bookingData.flight.arrival.airport}</div>
                <div className="terminal">Terminal {bookingData.flight.arrival.terminal} • Baggage: {bookingData.flight.arrival.baggageClaim}</div>
              </div>
            </FlightTimeline>
            
            <FlightStatus>
              <StatusItem>
                <div className="label">Flight Status</div>
                <div className="value">
                  <span className={`status ${bookingData.flight.departure.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {bookingData.flight.departure.status}
                  </span>
                </div>
              </StatusItem>
              <StatusItem>
                <div className="label">Check-in</div>
                <div className="value">
                  {bookingData.flight.checkInStatus === 'Available' ? (
                    <CheckInButton onClick={handleCheckIn}>
                      Check-in Now
                    </CheckInButton>
                  ) : (
                    <span className="check-in-closed">
                      Opens {formatDate(bookingData.flight.checkInOpens)}
                    </span>
                  )}
                </div>
              </StatusItem>
              <StatusItem>
                <div className="label">Check-in Closes</div>
                <div className="value">
                  {formatDate(bookingData.flight.checkInCloses)}
                </div>
              </StatusItem>
            </FlightStatus>
            
            <Amenities>
              <h4>Onboard Amenities</h4>
              <AmenityList>
                {bookingData.flight.amenities.map((amenity, index) => (
                  <AmenityItem key={index}>
                    <span className="dot" />
                    {amenity}
                  </AmenityItem>
                ))}
              </AmenityList>
            </Amenities>
          </Section>
          
          <Section>
            <SectionHeader>
              <h2><FaUser /> Passenger Information</h2>
              <div className="passenger-count">{bookingData.passengers.length} {bookingData.passengers.length === 1 ? 'Passenger' : 'Passengers'}</div>
            </SectionHeader>
            
            <PassengerList>
              {bookingData.passengers.map((passenger) => (
                <PassengerCard key={passenger.id}>
                  <PassengerHeader>
                    <div>
                      <h3>{passenger.name}</h3>
                      <PassengerType>{passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}</PassengerType>
                    </div>
                    <SeatBadge>Seat {passenger.seat}</SeatBadge>
                  </PassengerHeader>
                  
                  <PassengerDetails>
                    <DetailItem>
                      <div className="label">Baggage Allowance</div>
                      <div className="value">{passenger.baggage || bookingData.flight.baggageAllowance.checked}</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="label">Meal Preference</div>
                      <div className="value">{passenger.mealPreference || 'Standard'}</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="label">Frequent Flyer #</div>
                      <div className="value">Not added</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="label">Passport #</div>
                      <div className="value">Not added</div>
                    </DetailItem>
                  </PassengerDetails>
                  
                  <PassengerActions>
                    <ActionButton small>Update Details</ActionButton>
                    <ActionButton small outline>Add Passport</ActionButton>
                  </PassengerActions>
                </PassengerCard>
              ))}
            </PassengerList>
            
            <ContactInfo>
              <h4>Contact Information</h4>
              <div className="details">
                <div>
                  <div className="label">Name</div>
                  <div className="value">{bookingData.contactInfo.name}</div>
                </div>
                <div>
                  <div className="label">Email</div>
                  <div className="value">{bookingData.contactInfo.email}</div>
                </div>
                <div>
                  <div className="label">Phone</div>
                  <div className="value">{bookingData.contactInfo.phone}</div>
                </div>
                <div>
                  <div className="label">Billing Address</div>
                  <div className="value">{bookingData.contactInfo.address}</div>
                </div>
              </div>
            </ContactInfo>
          </Section>
          
          {bookingData.returnFlight && (
            <Section>
              <SectionHeader>
                <h2><FaPlane style={{ transform: 'rotate(180deg)' }} /> Return Flight</h2>
              </SectionHeader>
              {/* Similar flight details for return flight */}
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Return flight details would be displayed here
              </div>
            </Section>
          )}
          
          <Section>
            <SectionHeader>
              <h2>Fare Rules & Policies</h2>
            </SectionHeader>
            
            <FareRules>
              <RuleItem>
                <div className="label">Changes</div>
                <div className="value">{bookingData.flight.fareRules.changes}</div>
              </RuleItem>
              <RuleItem>
                <div className="label">Cancellations</div>
                <div className="value">{bookingData.flight.fareRules.cancellations}</div>
              </RuleItem>
              <RuleItem>
                <div className="label">Refundable</div>
                <div className="value">{bookingData.flight.fareRules.refundable}</div>
              </RuleItem>
              <RuleItem>
                <div className="label">Fees</div>
                <div className="value">{bookingData.flight.fareRules.fees}</div>
              </RuleItem>
            </FareRules>
            
            <ImportantNotes>
              <h4><FaExclamationTriangle /> Important Notes</h4>
              <ul>
                {bookingData.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </ImportantNotes>
          </Section>
        </MainContent>
        
        <Sidebar>
          <ActionCard>
            <h3>Your Itinerary</h3>
            
            <ItineraryItem>
              <div className="icon"><FaPlaneDeparture /></div>
              <div className="details">
                <div className="title">Departure</div>
                <div className="time">{departureTime ? formatDate(departureTime) : 'N/A'}</div>
                <div className="location">
                  {bookingData.flight.departure.city} ({bookingData.flight.departure.code}) → {bookingData.flight.arrival.city} ({bookingData.flight.arrival.code})
                </div>
              </div>
            </ItineraryItem>
            
            {bookingData.returnFlight && (
              <ItineraryItem>
                <div className="icon"><FaPlaneArrival /></div>
                <div className="details">
                  <div className="title">Return</div>
                  <div className="time">
                    {formatDate(bookingData.returnFlight.departure.scheduled)}
                  </div>
                  <div className="location">
                    {bookingData.returnFlight.departure.city} → {bookingData.returnFlight.arrival.city}
                  </div>
                </div>
              </ItineraryItem>
            )}
            
            <Divider />
            
            <ActionButton primary onClick={handlePrintTicket}>
              <FaPrint /> Print Itinerary
            </ActionButton>
            <ActionButton onClick={handleEmailTicket}>
              <FaEnvelope /> Email Itinerary
            </ActionButton>
            <ActionButton onClick={handleDownloadTicket}>
              <FaTicketAlt /> Download Ticket
            </ActionButton>
          </ActionCard>
          
          <ActionCard>
            <h3>Price Summary</h3>
            
            <PriceSummary>
              <PriceRow>
                <div className="label">Base Fare ({bookingData.passengers.length} {bookingData.passengers.length === 1 ? 'Passenger' : 'Passengers'})</div>
                <div className="value">₹{baseFare.toFixed(2)}</div>
              </PriceRow>
              
              {bookingData.addOns.length > 0 && (
                <>
                  <PriceRow>
                    <div className="label">Add-ons</div>
                    <div className="value">₹{totalAddOns.toFixed(2)}</div>
                  </PriceRow>
                  
                  <AddOnsList>
                    {bookingData.addOns.map((addOn) => (
                      <AddOnItem key={addOn.id}>
                        <div className="name">{addOn.name} (x{addOn.quantity})</div>
                        <div className="price">₹{(addOn.price * addOn.quantity).toFixed(2)}</div>
                      </AddOnItem>
                    ))}
                  </AddOnsList>
                </>
              )}
              
              <Divider />
              
              <PriceRow total>
                <div className="label">Total Amount</div>
                <div className="value">₹{bookingData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </PriceRow>
              
              <PriceRow>
                <div className="label">Payment Status</div>
                <div className="value status">
                  <span className={`status-${bookingData.payment.status.toLowerCase()}`}>
                    {bookingData.payment.status}
                  </span>
                </div>
              </PriceRow>
              
              <PriceRow>
                <div className="label">Paid with</div>
                <div className="value">{bookingData.payment.method}</div>
              </PriceRow>
              
              <PriceRow>
                <div className="label">Transaction ID</div>
                <div className="value">{bookingData.payment.transactionId}</div>
              </PriceRow>
            </PriceSummary>
            
            <Divider />
            
            <ActionButton primary fullWidth onClick={handleModifyBooking}>
              Modify Booking
            </ActionButton>
            
            <ActionButton 
              danger 
              fullWidth 
              onClick={handleCancelBooking}
              disabled={bookingData.status === 'cancelled' || isCancelling}
            >
              {isCancelling ? 'Cancelling...' : bookingData.status === 'cancelled' ? 'Booking Cancelled' : 'Cancel Booking'}
            </ActionButton>
            
            {bookingData.status === 'cancelled' && (
              <CancellationNotice>
                <FaTimesCircle />
                <div>
                  <strong>Booking Cancelled</strong>
                  <p>A cancellation email has been sent to {bookingData.contactInfo.email}</p>
                </div>
              </CancellationNotice>
            )}
          </ActionCard>
          
          <NeedHelp>
            <h4>Need Help?</h4>
            <p>Our customer service team is available 24/7 to assist you with your booking.</p>
            <ActionButton fullWidth>Contact Support</ActionButton>
          </NeedHelp>
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
  
  @media print {
    padding: 0;
    
    .no-print {
      display: none !important;
    }
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const NotFound = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.danger};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.black};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const BookingNumber = styled.div`
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 0.25rem;
  font-size: 0.9375rem;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
  
  background: ${({ status, theme }) => {
    switch (status) {
      case 'confirmed':
        return '#e8f5e9';
      case 'cancelled':
        return '#ffebee';
      case 'pending':
        return '#fff8e1';
      default:
        return theme.colors.grayLighter;
    }
  }};
  
  color: ${({ status, theme }) => {
    switch (status) {
      case 'confirmed':
        return '#2e7d32';
      case 'cancelled':
        return '#c62828';
      case 'pending':
        return '#f57f17';
      default:
        return theme.colors.grayDark;
    }
  }};
  
  svg {
    font-size: 1rem;
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
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: ${({ theme }) => theme.colors.black};
    
    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  .passenger-count, .flight-number {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};
    font-weight: 500;
  }
`;

const FlightTimeline = styled.div`
  display: flex;
  padding: 1.5rem;
  
  .departure, .arrival {
    flex: 1;
    
    .time {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    
    .date {
      font-size: 0.9375rem;
      color: ${({ theme }) => theme.colors.gray};
      margin-bottom: 0.5rem;
    }
    
    .airport {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .terminal {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const FlightRoute = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  
  .duration {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    
    .time {
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .line {
      width: 100%;
      height: 1px;
      background: ${({ theme }) => theme.colors.grayLight};
      position: relative;
      margin: 0.5rem 0;
      
      &::before, &::after {
        content: '';
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
  }
  
  .aircraft {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray};
    text-align: center;
    
    div {
      margin-bottom: 0.25rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0;
    
    .duration {
      flex-direction: row;
      justify-content: space-between;
      
      .line {
        flex: 1;
        margin: 0 1rem;
        
        &::before, &::after {
          display: none;
        }
      }
      
      .stops {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 0 0.5rem;
      }
    }
  }
`;

const FlightStatus = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-top: 1px solid ${({ theme }) => theme.colors.grayLight};
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatusItem = styled.div`
  .label {
    font-size: 0.8125rem;
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-weight: 500;
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 500;
      
      &.on-time {
        background: #e8f5e9;
        color: #2e7d32;
      }
      
      &.delayed {
        background: #fff8e1;
        color: #f57f17;
      }
      
      &.cancelled {
        background: #ffebee;
        color: #c62828;
      }
    }
    
    .check-in-closed {
      color: ${({ theme }) => theme.colors.gray};
      font-size: 0.9375rem;
    }
  }
`;

const CheckInButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const Amenities = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};
  
  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.grayDark};
  }
`;

const AmenityList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const AmenityItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grayDark};
  
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const PassengerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const PassengerCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;

const PassengerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
  }
`;

const PassengerType = styled.span`
  display: inline-block;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: 0.25rem;
`;

const SeatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  
  &::before {
    content: '\f186';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PassengerDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  .label {
    font-size: 0.8125rem;
    color: ${({ theme }) => theme.colors.gray};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-weight: 500;
  }
`;

const PassengerActions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ContactInfo = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.grayLighter};
  
  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.grayDark};
  }
  
  .details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    
    @media (max-width: 576px) {
      grid-template-columns: 1fr;
    }
    
    .label {
      font-size: 0.8125rem;
      color: ${({ theme }) => theme.colors.gray};
      margin-bottom: 0.25rem;
    }
    
    .value {
      font-weight: 500;
    }
  }
`;

const FareRules = styled.div`
  padding: 1.5rem;
`;

const RuleItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    flex: 0 0 120px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.grayDark};
  }
  
  .value {
    flex: 1;
  }
`;

const ImportantNotes = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-top: 1px solid ${({ theme }) => theme.colors.grayLight};
  
  h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.danger};
    
    svg {
      font-size: 1.125rem;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    color: ${({ theme }) => theme.colors.grayDark};
    
    li {
      margin-bottom: 0.5rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: 993px) {
    position: sticky;
    top: 2rem;
    align-self: flex-start;
  }
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  
  h3 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors.black};
  }
`;

const ItineraryItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};
  
  &:last-child {
    border-bottom: none;
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
  
  .details {
    flex: 1;
    
    .title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .time {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray};
      margin-bottom: 0.25rem;
    }
    
    .location {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.grayDark};
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.grayLighter};
  margin: 1.5rem 0;
`;

const PriceSummary = styled.div`
  margin-bottom: 1.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  
  ${({ total }) => total && `
    margin: 1.5rem 0;
    padding-top: 1rem;
    border-top: 1px dashed ${({ theme }) => theme.colors.grayLight};
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  `}
  
  .label {
    color: ${({ theme, total }) => total ? theme.colors.black : theme.colors.gray};
  }
  
  .status {
    font-weight: 500;
    
    &.status-paid {
      color: #2e7d32;
    }
    
    &.status-pending {
      color: #f57f17;
    }
    
    &.status-failed {
      color: #c62828;
    }
  }
`;

const AddOnsList = styled.div`
  margin: 0.5rem 0 1rem;
  padding-left: 1rem;
  border-left: 2px solid ${({ theme }) => theme.colors.grayLighter};
`;

const AddOnItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grayDark};
  margin-bottom: 0.5rem;
  
  .name {
    flex: 1;
  }
  
  .price {
    font-weight: 500;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: ${({ small }) => small ? '0.5rem 1rem' : '0.75rem 1.5rem'};
  background: ${({ primary, danger, theme }) => 
    primary ? theme.colors.primary : 
    danger ? theme.colors.danger : 
    'transparent'};
  color: ${({ primary, danger, outline, theme }) => 
    primary || danger ? 'white' : 
    outline ? theme.colors.primary : theme.colors.grayDark};
  border: 1px solid ${({ primary, danger, outline, theme }) => 
    primary || danger ? 'transparent' : 
    outline ? theme.colors.primary : theme.colors.grayLight};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ small }) => small ? '0.8125rem' : '0.9375rem'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${({ small }) => small ? '0' : '0.75rem'};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: ${({ primary, danger, outline, theme }) => 
      primary ? theme.colors.primaryDark : 
      danger ? theme.colors.dangerDark : 
      outline ? theme.colors.primaryLight : theme.colors.grayLighter};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    font-size: ${({ small }) => small ? '0.875rem' : '1rem'};
  }
`;

const CancellationNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #ffebee;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  margin-top: 1.5rem;
  
  svg {
    color: #c62828;
    font-size: 1.25rem;
    margin-top: 0.125rem;
  }
  
  div {
    flex: 1;
    
    strong {
      display: block;
      margin-bottom: 0.25rem;
      color: #c62828;
    }
    
    p {
      margin: 0;
      font-size: 0.875rem;
      color: #c62828;
      opacity: 0.9;
    }
  }
`;

const NeedHelp = styled.div`
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  text-align: center;
  
  h4 {
    margin: 0 0 0.75rem;
    color: ${({ theme }) => theme.colors.primaryDark};
    font-size: 1.125rem;
  }
  
  p {
    margin: 0 0 1.25rem;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.9375rem;
    line-height: 1.5;
  }
`;

export default BookingDetailsPage;
