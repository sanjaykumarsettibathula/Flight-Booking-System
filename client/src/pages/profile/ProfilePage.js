import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSave,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import { login } from "../../features/auth/authSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update user in Redux store
      dispatch(
        login.fulfilled({
          token,
          user: data.data,
        })
      );

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      // Update token if provided
      if (data.token) {
        localStorage.setItem("token", data.token);
        dispatch(
          login.fulfilled({
            token: data.token,
            user: data.data,
          })
        );
      }

      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaUser /> My Profile
        </Title>
        <Subtitle>Manage your account information and settings</Subtitle>
      </Header>

      <ProfileCard>
        <CardHeader>
          <Avatar>
            <FaUser />
          </Avatar>
          <UserInfo>
            <UserName>{user?.name || "User"}</UserName>
            <UserEmail>{user?.email || ""}</UserEmail>
          </UserInfo>
        </CardHeader>

        <CardBody>
          <Section>
            <SectionHeader>
              <SectionTitle>Personal Information</SectionTitle>
              {!isEditing && (
                <EditButton onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </EditButton>
              )}
            </SectionHeader>

            {isEditing ? (
              <Form onSubmit={handleUpdateProfile}>
                <FormGroup>
                  <Label>
                    <FaUser /> Full Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaEnvelope /> Email Address
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaPhone /> Phone Number
                  </Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </FormGroup>

                <FormActions>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                      });
                    }}
                  >
                    <FaTimesCircle /> Cancel
                  </Button>
                  <Button type="submit" primary disabled={loading}>
                    <FaSave /> {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </FormActions>
              </Form>
            ) : (
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>
                    <FaUser /> Full Name
                  </InfoLabel>
                  <InfoValue>{user?.name || "Not set"}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>
                    <FaEnvelope /> Email Address
                  </InfoLabel>
                  <InfoValue>{user?.email || "Not set"}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>
                    <FaPhone /> Phone Number
                  </InfoLabel>
                  <InfoValue>{user?.phone || "Not set"}</InfoValue>
                </InfoItem>
              </InfoGrid>
            )}
          </Section>

          <Divider />

          <Section>
            <SectionHeader>
              <SectionTitle>Security</SectionTitle>
              {!isChangingPassword && (
                <EditButton onClick={() => setIsChangingPassword(true)}>
                  <FaLock /> Change Password
                </EditButton>
              )}
            </SectionHeader>

            {isChangingPassword ? (
              <Form onSubmit={handleChangePassword}>
                <FormGroup>
                  <Label>
                    <FaLock /> Current Password
                  </Label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaLock /> New Password
                  </Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FaLock /> Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </FormGroup>

                <FormActions>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    <FaTimesCircle /> Cancel
                  </Button>
                  <Button type="submit" primary disabled={loading}>
                    <FaCheckCircle />{" "}
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </FormActions>
              </Form>
            ) : (
              <SecurityInfo>
                <p>
                  <FaLock /> Your password is encrypted and secure. Click "Change
                  Password" to update it.
                </p>
              </SecurityInfo>
            )}
          </Section>
        </CardBody>
      </ProfileCard>
    </Container>
  );
};

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.black};
  font-size: 2rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 1rem;
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
`;

const UserEmail = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.black};
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: 0.5rem;
  font-weight: 500;

  svg {
    font-size: 0.875rem;
  }
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.black};
  font-weight: 500;
`;

const SecurityInfo = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.grayDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.grayLighter};
  margin: 2rem 0;
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
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayDark};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.875rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.grayLight};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}40;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.grayLighter};
    cursor: not-allowed;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ primary, theme }) =>
    primary ? theme.colors.primary : "transparent"};
  color: ${({ primary, theme }) =>
    primary ? "white" : theme.colors.grayDark};
  border: 1px solid
    ${({ primary, theme }) =>
      primary ? theme.colors.primary : theme.colors.grayLight};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ primary, theme }) =>
      primary ? theme.colors.primaryDark : theme.colors.grayLighter};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ProfilePage;
