import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import styled from 'styled-components';
import { Form, Input, Button, Message } from '../styles/GlobalStyles';

const AuctionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AuctionImageColumn = styled.div`
  img {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const AuctionDetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuctionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const AuctionDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  flex-grow: 1;
  margin-bottom: 1.5rem;
`;

const AuctionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #777;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
`;

const PriceBox = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;

  .price-label {
    font-size: 1rem;
    color: #555;
    display: block;
    margin-bottom: 0.5rem;
  }

  .price-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #B12704;
    display: block;
  }

  .bidder-info {
    font-size: 0.9rem;
    color: #555;
    margin-top: 0.5rem;
  }
`;

const BidForm = styled(Form)`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const BidInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex-grow: 1;
    font-size: 1.1rem;
  }

  button {
    font-size: 1.1rem;
    background-color: #f0c14b;
    border: 1px solid #a88734;
    color: #111;

    &:hover {
      background-color: #eab530;
    }
  }
`;

const OwnerNotice = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #555;
`;

const Auction = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      loadAuction();
    }
  }, [id]);

  const loadAuction = async () => {
    try {
      const data = await apiService.getListing(id);
      setListing(data);
    } catch (error) {
      setMessage('Error loading auction details.');
      console.error('Failed to load auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to place a bid.');
      return;
    }

    setBidLoading(true);
    setMessage('');

    try {
      await apiService.placeBid(id, parseFloat(bidAmount));
      setBidAmount('');
      loadAuction(); // Refresh auction details
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return <div>Loading auction...</div>;
  }

  if (!listing) {
    return <div>Listing not found.</div>;
  }

  const isOwner = listing.seller && listing.seller._id === user?.id;
  const highestBidderName = listing.highestBidder ? listing.highestBidder.name : 'No bids yet';
  const winnerName = listing.winner ? listing.winner.name : 'N/A';

  const renderBidSection = () => {
    if (listing.status === 'ended') {
      return (
        <OwnerNotice>
          <h3>Auction Ended</h3>
          <p>Winner: <strong>{winnerName}</strong></p>
          <p>Winning Bid: <strong>₹{listing.currentBid.toLocaleString()}</strong></p>
        </OwnerNotice>
      );
    } else if (listing.status === 'pending') {
      return (
        <OwnerNotice>
          <h3>Auction Starts Soon</h3>
          <p>Bidding will open at {new Date(listing.startTime).toLocaleString()}.</p>
        </OwnerNotice>
      );
    } else if (listing.status === 'active') {
      if (isOwner) {
        return (
          <OwnerNotice>
            <p>You cannot bid on your own listing.</p>
          </OwnerNotice>
        );
      } else {
        return (
          <BidForm onSubmit={handleBidSubmit}>
            <h3>Place Your Bid</h3>
            <BidInputGroup>
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={listing.currentBid + 1}
                required
              />
              <Button type="submit" disabled={bidLoading}>
                {bidLoading ? 'Placing...' : 'Place Bid'}
              </Button>
            </BidInputGroup>
          </BidForm>
        );
      }
    }
  };

  return (
    <AuctionContainer>
      <AuctionImageColumn>
        <img src={listing.image} alt={listing.title} />
      </AuctionImageColumn>
      <AuctionDetailsColumn>
        <AuctionTitle>{listing.title}</AuctionTitle>
        <AuctionDescription>{listing.description}</AuctionDescription>
        <AuctionMeta>
          <span>Seller: <em>{listing.seller ? listing.seller.name : 'Unknown'}</em></span>
          <span>Starts: <em>{new Date(listing.startTime).toLocaleString()}</em></span>
          <span>Ends: <em>{new Date(listing.endTime).toLocaleString()}</em></span>
        </AuctionMeta>
        <PriceBox>
          <span className="price-label">
            {listing.status === 'ended' ? 'Winning Bid' : 'Current Bid'}
          </span>
          <span className="price-value">₹{listing.currentBid.toLocaleString()}</span>
          <div className="bidder-info">
            {listing.status === 'ended' ? 'Winner:' : 'Highest bid by:'} <strong>
              {listing.status === 'ended' ? winnerName : highestBidderName}
            </strong>
          </div>
        </PriceBox>
        {renderBidSection()}
        {message && (
          <Message style={{ 
            color: 'red',
            backgroundColor: '#f8d7da'
          }}>
            {message}
          </Message>
        )}
      </AuctionDetailsColumn>
    </AuctionContainer>
  );
};

export default Auction;
