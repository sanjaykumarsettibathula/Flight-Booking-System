import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const NotFoundPage = () => {
  return (
    <Container>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <HomeLink to="/">Go back home</HomeLink>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: center;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export default NotFoundPage;
