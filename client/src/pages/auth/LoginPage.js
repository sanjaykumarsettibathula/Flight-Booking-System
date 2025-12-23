import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { login } from "../../features/auth/authSlice";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

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

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </AuthHeader>

        <AuthForm onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </FormGroup>

          <FormGroup>
            <div className="flex justify-between">
              <label htmlFor="password">Password</label>
              <ForgotPasswordLink to="/forgot-password">
                Forgot Password?
              </ForgotPasswordLink>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </SubmitButton>
        </AuthForm>

        <AuthFooter>
          <p>
            Don't have an account?{" "}
            <Link
              to={redirect ? `/register?redirect=${redirect}` : "/register"}
            >
              Sign up
            </Link>
          </p>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
};

// Styled Components
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

const ForgotPasswordLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    text-decoration: underline;
  }
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

export default LoginPage;
