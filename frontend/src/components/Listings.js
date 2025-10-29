import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ListingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  &.ended .product-image img {
    filter: grayscale(80%);
  }

  &.pending .product-image img {
    filter: brightness(0.8);
  }
`;

const StatusOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${ProductCard}.ended & {
    opacity: 1;
  }

  ${ProductCard}.pending & {
    opacity: 1;
    background: rgba(0, 0, 0, 0.4);
    color: white;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductImage = styled.div`
  width: 100%;
  padding-top: 100%;
  position: relative;
  background-color: #f0f0f0;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  flex-grow: 1;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  margin-top: auto;
  margin-bottom: 0.5rem;
`;

const PriceLabel = styled.span`
  font-size: 0.8rem;
  color: #555;
`;

const PriceValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #B12704;
`;

const HighestBidder = styled.div`
  font-size: 0.8rem;
  color: #555;
`;

const BidderLabel = styled.span`
  font-weight: 500;
`;

const BidderName = styled.span`
  font-weight: 600;
  color: #111;
`;

const OwnerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
`;

const EditButton = styled(Link)`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  background-color: #f0c14b;
  border: 1px solid #a88734;
  color: #111;
`;

const DeleteButton = styled.button`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  background-color: #e7e7e7;
  border: 1px solid #adadad;
  color: #111;
  cursor: pointer;
`;

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const data = await apiService.getListings();
      setListings(data);
    } catch (error) {
      setError('Error loading listings. Please try again later.');
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await apiService.deleteListing(id);
        loadListings();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div>Loading listings...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!listings.length) {
    return <div>No listings available.</div>;
  }

  return (
    <>
      <h2>Current Listings</h2>
      <ListingsContainer>
        {listings.map((listing) => {
          const isOwner = listing.seller && listing.seller._id === user?.id;
          const highestBidderName = listing.highestBidder ? listing.highestBidder.name : 'No bids yet';
          const winnerName = listing.winner ? listing.winner.name : 'N/A';
          
          let cardClass = 'product-card';
          let statusText = '';
          if (listing.status === 'ended') {
            cardClass += ' ended';
            statusText = 'Auction Ended';
          } else if (listing.status === 'pending') {
            cardClass += ' pending';
            statusText = 'Starts Soon';
          }

          return (
            <ProductCard key={listing._id} className={cardClass}>
              <StatusOverlay>
                <span>{statusText}</span>
              </StatusOverlay>
              <CardLink to={`/auction/${listing._id}`}>
                <ProductImage>
                  <img src={listing.image} alt={listing.title} />
                </ProductImage>
                <ProductInfo>
                  <ProductTitle>{listing.title}</ProductTitle>
                  <ProductDescription>
                    {listing.description.substring(0, 100)}...
                  </ProductDescription>
                  <ProductPrice>
                    <PriceLabel>
                      {listing.status === 'ended' ? 'Winning Bid:' : 'Current Bid:'}
                    </PriceLabel>
                    <br />
                    <PriceValue>₹{listing.currentBid.toLocaleString()}</PriceValue>
                  </ProductPrice>
                  <HighestBidder>
                    <BidderLabel>
                      {listing.status === 'ended' ? 'Winner:' : 'Highest Bid by:'}
                    </BidderLabel>
                    <br />
                    <BidderName>
                      {listing.status === 'ended' ? winnerName : highestBidderName}
                    </BidderName>
                  </HighestBidder>
                </ProductInfo>
              </CardLink>
              {isOwner && (
                <OwnerActions>
                  <EditButton to={`/edit-listing/${listing._id}`}>Edit</EditButton>
                  <DeleteButton onClick={() => handleDelete(listing._id)}>
                    Delete
                  </DeleteButton>
                </OwnerActions>
              )}
            </ProductCard>
          );
        })}
      </ListingsContainer>
    </>
  );
};

export default Listings;
