// ✅ ALL NECESSARY IMPORTS FOR FeedbackPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// import RatingComponent from './'; // ✅ IMPORT RATING
import ReviewComponent from './ReviewComponent'; // ✅ IMPORT REVIEW

// Then all your styled components...
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

// ... rest of your styled components ...

const FeedbackPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('rating');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, isAuthenticated, navigate]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const data = await api.getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError('Failed to load transaction details. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/transactions');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading transaction details...</LoadingSpinner>
      </Container>
    );
  }

  if (error || !transaction) {
    return (
      <Container>
        <ErrorMessage>
          {error || 'Transaction not found'}
        </ErrorMessage>
      </Container>
    );
  }

  const isBuyer = transaction.buyer._id === user.id;
  const otherUser = isBuyer ? transaction.seller : transaction.buyer;

  return (
    <Container>
      <Header>
        <Title>Leave Feedback</Title>
        <p style={{ color: '#666', marginBottom: 0 }}>
          Help improve our community by sharing your experience with this transaction.
        </p>
        
        <ListingInfo>
          <ListingImage 
            src={transaction.listing?.image || '/placeholder.jpg'} 
            alt={transaction.listing?.title}
          />
          <ListingDetails>
            <ListingTitle>{transaction.listing?.title}</ListingTitle>
            <ListingPrice>${transaction.finalPrice}</ListingPrice>
            <SellerInfo>
              {isBuyer ? 'Seller' : 'Buyer'}: {otherUser.name}
            </SellerInfo>
            <SellerInfo>
              Transaction Date: {new Date(transaction.createdAt).toLocaleDateString()}
            </SellerInfo>
          </ListingDetails>
        </ListingInfo>
      </Header>

      <InfoBox>
        ℹ️ <strong>What's the difference?</strong>
        <br />
        <strong>Rating:</strong> Quick 1-5 star rating with optional comment
        <br />
        <strong>Review:</strong> Detailed feedback with title and description (visible to other users)
      </InfoBox>

      <TabContainer>
        <Tab 
          active={activeTab === 'rating'} 
          onClick={() => setActiveTab('rating')}
        >
          ⭐ Leave a Rating
        </Tab>
        <Tab 
          active={activeTab === 'review'} 
          onClick={() => setActiveTab('review')}
        >
          📝 Write a Review
        </Tab>
      </TabContainer>

      {/* ✅ USE RATING COMPONENT */}
      {activeTab === 'rating' && (
        <RatingComponent
          ratedUserId={otherUser._id}
          listingId={transaction.listing._id}
          onSuccess={handleSuccess}
          onCancel={() => navigate('/transactions')}
        />
      )}

      {/* ✅ USE REVIEW COMPONENT */}
      {activeTab === 'review' && (
        <ReviewComponent
          reviewedUserId={otherUser._id}
          listingId={transaction.listing._id}
          transactionId={transaction._id}
          onSuccess={handleSuccess}
          onCancel={() => navigate('/transactions')}
        />
      )}
    </Container>
  );
};

export default FeedbackPage;