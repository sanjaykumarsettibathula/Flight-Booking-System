import React from "react";
import styled from "styled-components";

const BookingPage = () => {
  return (
    <Container>
      <h1>Booking Flow</h1>
      <p>
        Start by searching for a flight, selecting your seats, and then completing
        passenger details and payment.
      </p>
      <p>
        You can view a specific booking's details from your confirmation page or
        from a dedicated bookings list in a future enhancement.
      </p>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

export default BookingPage;
