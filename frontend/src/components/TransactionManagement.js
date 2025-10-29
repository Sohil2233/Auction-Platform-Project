import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const FilterTab = styled.button`
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#007bff'};
  border: 1px solid #007bff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const TransactionCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
`;

const ItemPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #28a745;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'pending_payment': return '#ffc107';
      case 'paid': return '#17a2b8';
      case 'shipped': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'disputed': return '#fd7e14';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const TransactionDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  color: #666;
  font-size: 14px;
`;

const DetailValue = styled.span`
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return '#007bff';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return 'white';
      case 'success': return 'white';
      case 'warning': return '#212529';
      case 'danger': return 'white';
      default: return '#007bff';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return '#007bff';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#007bff';
    }
  }};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
`;

const TransactionManagement = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, activeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const status = activeFilter === 'all' ? undefined : activeFilter;
      const response = await api.getTransactions(1, 50, status);
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId, status, data = {}) => {
    try {
      await api.updateTransactionStatus(transactionId, status, data);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction._id === transactionId 
            ? { ...transaction, status, ...data }
            : transaction
        )
      );
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const openModal = (transaction, action) => {
    setSelectedTransaction(transaction);
    setModalData({ action, ...transaction });
    setModalOpen(true);
  };

  const getStatusActions = (transaction) => {
    const actions = [];
    const isBuyer = transaction.buyer._id === user.id;
    const isSeller = transaction.seller._id === user.id;

    switch (transaction.status) {
      case 'pending_payment':
        if (isBuyer) {
          actions.push(
            <ActionButton 
              key="mark-paid" 
              variant="success"
              onClick={() => openModal(transaction, 'mark_paid')}
            >
              Mark as Paid
            </ActionButton>
          );
        }
        break;
      case 'paid':
        if (isSeller) {
          actions.push(
            <ActionButton 
              key="mark-shipped" 
              variant="primary"
              onClick={() => openModal(transaction, 'mark_shipped')}
            >
              Mark as Shipped
            </ActionButton>
          );
        }
        break;
      case 'shipped':
        if (isBuyer) {
          actions.push(
            <ActionButton 
              key="mark-delivered" 
              variant="success"
              onClick={() => openModal(transaction, 'mark_delivered')}
            >
              Mark as Delivered
            </ActionButton>
          );
        }
        break;
      case 'delivered':
        if (isBuyer || isSeller) {
          actions.push(
            <ActionButton 
              key="complete" 
              variant="success"
              onClick={() => updateTransactionStatus(transaction._id, 'completed')}
            >
              Complete Transaction
            </ActionButton>
          );
        }
        break;
    }

    return actions;
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    const { action } = modalData;

    return (
      <Modal onClick={() => setModalOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {action === 'mark_paid' && 'Mark as Paid'}
              {action === 'mark_shipped' && 'Mark as Shipped'}
              {action === 'mark_delivered' && 'Mark as Delivered'}
            </ModalTitle>
            <CloseButton onClick={() => setModalOpen(false)}>×</CloseButton>
          </ModalHeader>

          {action === 'mark_paid' && (
            <div>
              <p>Confirm that you have made the payment for this transaction.</p>
              <ActionButton 
                variant="success"
                onClick={() => updateTransactionStatus(selectedTransaction._id, 'paid')}
              >
                Confirm Payment
              </ActionButton>
            </div>
          )}

          {action === 'mark_shipped' && (
            <div>
              <FormGroup>
                <Label>Tracking Number</Label>
                <Input
                  type="text"
                  placeholder="Enter tracking number"
                  value={modalData.trackingNumber || ''}
                  onChange={e => setModalData({...modalData, trackingNumber: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Estimated Delivery Date</Label>
                <Input
                  type="date"
                  value={modalData.estimatedDelivery || ''}
                  onChange={e => setModalData({...modalData, estimatedDelivery: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Notes (Optional)</Label>
                <TextArea
                  placeholder="Add any additional notes..."
                  value={modalData.notes || ''}
                  onChange={e => setModalData({...modalData, notes: e.target.value})}
                />
              </FormGroup>
              <ActionButton 
                variant="primary"
                onClick={() => updateTransactionStatus(selectedTransaction._id, 'shipped', {
                  trackingNumber: modalData.trackingNumber,
                  estimatedDelivery: modalData.estimatedDelivery,
                  notes: modalData.notes
                })}
              >
                Mark as Shipped
              </ActionButton>
            </div>
          )}

          {action === 'mark_delivered' && (
            <div>
              <p>Confirm that you have received the item and it matches the description.</p>
              <ActionButton 
                variant="success"
                onClick={() => updateTransactionStatus(selectedTransaction._id, 'delivered')}
              >
                Confirm Delivery
              </ActionButton>
            </div>
          )}
        </ModalContent>
      </Modal>
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading transactions...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Transaction Management</Title>
      </Header>

      <FilterTabs>
        <FilterTab 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')}
        >
          All
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'pending_payment'} 
          onClick={() => setActiveFilter('pending_payment')}
        >
          Pending Payment
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'paid'} 
          onClick={() => setActiveFilter('paid')}
        >
          Paid
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'shipped'} 
          onClick={() => setActiveFilter('shipped')}
        >
          Shipped
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'delivered'} 
          onClick={() => setActiveFilter('delivered')}
        >
          Delivered
        </FilterTab>
        <FilterTab 
          active={activeFilter === 'completed'} 
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </FilterTab>
      </FilterTabs>

      {transactions.length === 0 ? (
        <EmptyState>
          <h3>No transactions found</h3>
          <p>You don't have any transactions matching the current filter.</p>
        </EmptyState>
      ) : (
        transactions.map((transaction) => (
          <TransactionCard key={transaction._id}>
            <TransactionHeader>
              <ItemInfo>
                <ItemImage 
                  src={transaction.listing?.image || '/placeholder.jpg'} 
                  alt={transaction.listing?.title}
                />
                <ItemDetails>
                  <ItemTitle>{transaction.listing?.title}</ItemTitle>
                  <ItemPrice>${transaction.finalPrice}</ItemPrice>
                </ItemDetails>
              </ItemInfo>
              <StatusBadge status={transaction.status}>
                {transaction.status.replace('_', ' ')}
              </StatusBadge>
            </TransactionHeader>

            <TransactionDetails>
              <DetailSection>
                <DetailLabel>Buyer</DetailLabel>
                <DetailValue>{transaction.buyer?.name}</DetailValue>
                <DetailLabel>Seller</DetailLabel>
                <DetailValue>{transaction.seller?.name}</DetailValue>
              </DetailSection>
              <DetailSection>
                <DetailLabel>Transaction Date</DetailLabel>
                <DetailValue>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </DetailValue>
                {transaction.trackingNumber && (
                  <>
                    <DetailLabel>Tracking Number</DetailLabel>
                    <DetailValue>{transaction.trackingNumber}</DetailValue>
                  </>
                )}
              </DetailSection>
            </TransactionDetails>

            <ActionButtons>
              {getStatusActions(transaction)}
              <ActionButton 
                onClick={() => openModal(transaction, 'view_details')}
              >
                View Details
              </ActionButton>
            </ActionButtons>
          </TransactionCard>
        ))
      )}

      {renderModal()}
    </Container>
  );
};

export default TransactionManagement;
