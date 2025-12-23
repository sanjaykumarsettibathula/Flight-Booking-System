import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { createBooking } from "../../features/bookings/bookingSlice";

const BookingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { flight, passengers } = location.state || {};

  const [formData, setFormData] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerPhone: "",
    seatNumber: "",
  });

  const { user } = useSelector((state) => state.auth);
  const { loading, error, success, booking } = useSelector(
    (state) => state.bookings
  );

  useEffect(() => {
    if (!flight) {
      navigate("/flights/search");
    }

    if (success && booking) {
      navigate(`/bookings/confirmation/${booking._id}`);
    }
  }, [flight, navigate, success, booking]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const bookingData = {
      ...formData,
      flightId: flight._id,
      amount: flight.currentPrice || flight.basePrice,
      journeyDate: flight.departureTime,
      userId: user?._id,
    };

    dispatch(createBooking(bookingData));
  };

  if (!flight) return null;

  return (
    <FormContainer>
      <h2>Complete Your Booking</h2>
      <FlightSummary>
        <h3>Flight Details</h3>
        <p>
          {flight.airline} - {flight.flightNumber}
        </p>
        <p>
          {flight.departureCity} → {flight.arrivalCity}
        </p>
        <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
        <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
        <p>Price: ₹{flight.currentPrice || flight.basePrice}</p>
      </FlightSummary>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Full Name</label>
          <input
            type="text"
            name="passengerName"
            value={formData.passengerName}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Email</label>
          <input
            type="email"
            name="passengerEmail"
            value={formData.passengerEmail}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Phone Number</label>
          <input
            type="tel"
            name="passengerPhone"
            value={formData.passengerPhone}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label>Seat Number</label>
          <select
            name="seatNumber"
            value={formData.seatNumber}
            onChange={handleChange}
            required
          >
            <option value="">Select a seat</option>
            {Array.from({ length: 10 }, (_, i) => `A${i + 1}`).map((seat) => (
              <option key={seat} value={seat}>
                {seat}
              </option>
            ))}
          </select>
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Processing..." : "Confirm Booking"}
        </SubmitButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FlightSummary = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  h3 {
    margin-top: 0;
    color: #333;
  }

  p {
    margin: 0.5rem 0;
    color: #555;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: #333;
  }

  input,
  select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
  }
`;

const SubmitButton = styled.button`
  background-color: #4a90e2;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #a0c0e0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
`;

export default BookingForm;
