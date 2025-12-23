import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { register } from "../../features/auth/authSlice";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, password, confirmPassword } = formData;
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

    dispatch(register(userData));
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <h2>Create an Account</h2>
          <p>Join us today and book your next flight</p>
        </AuthHeader>

        <AuthForm onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <PasswordHint>Minimum 6 characters</PasswordHint>
          </FormGroup>

          <FormGroup>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </SubmitButton>
        </AuthForm>

        <AuthFooter>
          <p>
            Already have an account?{" "}
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
              Sign In
            </Link>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
};

// Styled Components (reusing from LoginPage with minor adjustments)
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[4]};
  background-color: ${({ theme }) => theme.colors.grayLighter};
`;

const AuthCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 28rem;
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[6]};
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space[8]};

  h2 {
    color: ${({ theme }) => theme.colors.black};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    margin-bottom: ${({ theme }) => theme.space[2]};
  }

  p {
    color: ${({ theme }) => theme.colors.gray};
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
`;

const AuthForm = styled.form`
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space[4]};

  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.space[1]};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.grayDark};
  }

  input {
    width: 100%;
    padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
    border: 1px solid ${({ theme }) => theme.colors.grayLight};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.fontSizes.base};
    transition: ${({ theme }) => theme.transitions.default};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}40;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayLight};
    }
  }
`;

const PasswordHint = styled.p`
  margin-top: ${({ theme }) => theme.space[1]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.gray};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  margin-top: ${({ theme }) => theme.space[4]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grayLight};
    cursor: not-allowed;
  }
`;

const AuthFooter = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray};
  border-top: 1px solid ${({ theme }) => theme.colors.grayLight};
  padding-top: ${({ theme }) => theme.space[6]};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.default};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default RegisterPage;
