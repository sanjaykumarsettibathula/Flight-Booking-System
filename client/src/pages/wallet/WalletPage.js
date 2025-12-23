import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useAddFundsMutation,
  useTransferFundsMutation,
} from "../../features/wallet/walletSlice";

const WalletPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: walletResponse, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletQuery();
  const { data: transactionsResponse, isLoading: transactionsLoading } = useGetWalletTransactionsQuery();
  
  const [addFunds] = useAddFundsMutation();
  const [transferFunds] = useTransferFundsMutation();

  const wallet = walletResponse?.data;
  const transactions = transactionsResponse?.data || [];
  const balance = wallet?.balance || 0;

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await addFunds(amount).unwrap();
      toast.success(`Successfully added ₹${amount.toLocaleString()} to your wallet`);
      setAddFundsAmount("");
      setShowAddFundsModal(false);
      refetchWallet();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add funds");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!recipientId) {
      toast.error("Please enter recipient ID");
      return;
    }

    try {
      await transferFunds({ amount, recipientId }).unwrap();
      toast.success(`Successfully transferred ₹${amount.toLocaleString()}`);
      setTransferAmount("");
      setRecipientId("");
      setShowTransferModal(false);
      refetchWallet();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to transfer funds");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (walletLoading) {
    return (
      <Container>
        <LoadingMessage>Loading wallet...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaWallet /> My Wallet
        </Title>
        <Subtitle>Manage your wallet balance and transactions</Subtitle>
      </Header>

      <WalletCard>
        <WalletHeader>
          <div>
            <WalletLabel>Total Balance</WalletLabel>
            <WalletAmount>₹{Number(balance).toLocaleString()}</WalletAmount>
          </div>
          <WalletIcon>
            <FaWallet />
          </WalletIcon>
        </WalletHeader>

        <WalletActions>
          <ActionButton primary onClick={() => setShowAddFundsModal(true)}>
            <FaPlus /> Add Funds
          </ActionButton>
          <ActionButton onClick={() => setShowTransferModal(true)}>
            <FaArrowUp /> Transfer
          </ActionButton>
        </WalletActions>
      </WalletCard>

      <TransactionsSection>
        <SectionHeader>
          <h2>
            <FaHistory /> Transaction History
          </h2>
        </SectionHeader>

        {transactionsLoading ? (
          <LoadingMessage>Loading transactions...</LoadingMessage>
        ) : transactions.length === 0 ? (
          <EmptyState>
            <p>No transactions yet</p>
          </EmptyState>
        ) : (
          <TransactionsList>
            {transactions.map((transaction, index) => (
              <TransactionCard key={transaction._id || index}>
                <TransactionIcon type={transaction.type}>
                  {transaction.type === "credit" ? (
                    <FaArrowDown />
                  ) : (
                    <FaArrowUp />
                  )}
                </TransactionIcon>
                <TransactionDetails>
                  <TransactionDescription>
                    {transaction.description || "Transaction"}
                  </TransactionDescription>
                  <TransactionDate>
                    {formatDate(transaction.createdAt)}
                  </TransactionDate>
                </TransactionDetails>
                <TransactionAmount type={transaction.type}>
                  {transaction.type === "credit" ? "+" : "-"}₹
                  {Number(transaction.amount).toLocaleString()}
                </TransactionAmount>
              </TransactionCard>
            ))}
          </TransactionsList>
        )}
      </TransactionsSection>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <ModalOverlay onClick={() => setShowAddFundsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Add Funds to Wallet</h3>
              <CloseButton onClick={() => setShowAddFundsModal(false)}>
                <FaTimesCircle />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleAddFunds}>
                <FormGroup>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </FormGroup>
                <ModalActions>
                  <Button type="button" onClick={() => setShowAddFundsModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" primary>
                    <FaCheckCircle /> Add Funds
                  </Button>
                </ModalActions>
              </Form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <ModalOverlay onClick={() => setShowTransferModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Transfer Funds</h3>
              <CloseButton onClick={() => setShowTransferModal(false)}>
                <FaTimesCircle />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleTransfer}>
                <FormGroup>
                  <Label>Recipient User ID</Label>
                  <Input
                    type="text"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter recipient user ID"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </FormGroup>
                <ModalActions>
                  <Button type="button" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" primary>
                    <FaArrowUp /> Transfer
                  </Button>
                </ModalActions>
              </Form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem;
  }
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

const WalletCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  color: white;
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const WalletLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const WalletAmount = styled.div`
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
`;

const WalletIcon = styled.div`
  font-size: 4rem;
  opacity: 0.3;
`;

const WalletActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ primary, theme }) =>
    primary ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ primary }) =>
      primary ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"};
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;

const TransactionsSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};

  h2 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.black};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.grayLighter};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grayLight};
    transform: translateX(4px);
  }
`;

const TransactionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ type, theme }) =>
    type === "credit"
      ? "rgba(76, 175, 80, 0.2)"
      : "rgba(244, 67, 54, 0.2)"};
  color: ${({ type, theme }) =>
    type === "credit" ? "#4caf50" : "#f44336"};
  font-size: 1.25rem;
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 0.25rem;
`;

const TransactionDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray};
`;

const TransactionAmount = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ type, theme }) =>
    type === "credit" ? "#4caf50" : "#f44336"};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayLighter};

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.black};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grayLighter};
    color: ${({ theme }) => theme.colors.black};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grayDark};
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
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
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

  &:hover {
    background: ${({ primary, theme }) =>
      primary ? theme.colors.primaryDark : theme.colors.grayLighter};
  }
`;

export default WalletPage;
