import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import {
  FaPlane,
  FaUser,
  FaWallet,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import { logout } from "../../features/auth/authSlice";

const Layout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Don't show header/footer on auth pages
  if (["/login", "/register"].includes(location.pathname)) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <Header>
        <NavContainer>
          <Logo to="/">
            <FaPlane /> FlightBook
          </Logo>
          <Nav>
            <NavLink
              to="/flights"
              className={location.pathname === "/flights" ? "active" : ""}
            >
              Flights
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-bookings"
                  className={
                    location.pathname === "/my-bookings" ? "active" : ""
                  }
                >
                  My Bookings
                </NavLink>
                <NavLink
                  to="/wallet"
                  className={location.pathname === "/wallet" ? "active" : ""}
                >
                  <FaWallet /> Wallet
                </NavLink>
                <NavLink
                  to="/profile"
                  className={location.pathname === "/profile" ? "active" : ""}
                >
                  <FaUser /> {user?.name?.split(" ")[0]}
                </NavLink>
                <LogoutButton onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </LogoutButton>
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className="btn btn-outline">
                  <FaSignInAlt /> Login
                </NavLink>
                <NavLink to="/register" className="btn btn-primary">
                  <FaUserPlus /> Register
                </NavLink>
              </>
            )}
          </Nav>
        </NavContainer>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <FooterContainer>
          <FooterSection>
            <h4>FlightBook</h4>
            <p>Your trusted partner for seamless flight bookings.</p>
          </FooterSection>
          <FooterSection>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/flights">Search Flights</Link>
              </li>
              <li>
                <Link to="/my-bookings">My Bookings</Link>
              </li>
              <li>
                <Link to="/wallet">Wallet</Link>
              </li>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
            </ul>
          </FooterSection>
          <FooterSection>
            <h4>Contact Us</h4>
            <p>Email: support@flightbook.com</p>
            <p>Phone: +1 234 567 8900</p>
          </FooterSection>
        </FooterContainer>
        <FooterBottom>
          <p>
            &copy; {new Date().getFullYear()} FlightBook. All rights reserved.
          </p>
        </FooterBottom>
      </Footer>
    </LayoutContainer>
  );
};

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;

const NavContainer = styled.div`
  max-width: ${({ theme }) => theme.sizes.container.xl};
  margin: 0 auto;
  padding: ${({ theme }) => theme.space[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.grayDark};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: ${({ theme }) => theme.transitions.default};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.grayLighter};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerLight}20;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.space[6]} 0;
`;

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.grayLighter};
  color: ${({ theme }) => theme.colors.grayDark};
  padding: ${({ theme }) => theme.space[8]} 0 0;
`;

const FooterContainer = styled.div`
  max-width: ${({ theme }) => theme.sizes.container.xl};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.space[4]};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.space[8]};
`;

const FooterSection = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.space[4]};
  }

  p,
  li {
    margin-bottom: ${({ theme }) => theme.space[2]};
    color: ${({ theme }) => theme.colors.gray};
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: ${({ theme }) => theme.space[2]};
    }

    a {
      color: ${({ theme }) => theme.colors.gray};
      text-decoration: none;
      transition: ${({ theme }) => theme.transitions.default};

      &:hover {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding: ${({ theme }) => `${theme.space[6]} 0`};
  margin-top: ${({ theme }) => theme.space[8]};
  border-top: 1px solid ${({ theme }) => theme.colors.grayLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray};
`;

export default Layout;
