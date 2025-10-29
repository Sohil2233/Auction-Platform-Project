import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin-right: 20px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0 0 8px 0;
  color: #333;
`;

const UserEmail = styled.p`
  margin: 0 0 8px 0;
  color: #666;
`;

const TrustScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const TrustScoreValue = styled.span`
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#ffc107';
    return '#dc3545';
  }};
`;

const TrustScoreBar = styled.div`
  width: 100px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const TrustScoreFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#ffc107';
    return '#dc3545';
  }};
  width: ${props => props.score}%;
  transition: width 0.3s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  color: ${props => props.active ? '#007bff' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #007bff;
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: bold;
  color: #333;
`;

const ReviewDate = styled.span`
  color: #666;
  font-size: 12px;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#ffc107' : '#e0e0e0'};
  font-size: 16px;
`;

const ReviewTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
`;

const ReviewContent = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const HelpfulButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;

  &:hover {
    background: #f8f9fa;
  }
`;

const ResponseCard = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
  border-left: 3px solid #007bff;
`;

const ResponseHeader = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const ResponseContent = styled.p`
  margin: 0;
  color: #333;
  font-size: 14px;
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

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Note: In a real app, you'd have a user endpoint
      // For now, we'll fetch reviews and ratings
      const [reviewsResponse, ratingsResponse] = await Promise.all([
        api.getReviews(userId),
        api.getRatings(userId)
      ]);
      
      setReviews(reviewsResponse.reviews);
      setRatings(ratingsResponse.ratings);
      
      // Mock user data - in real app, fetch from user endpoint
      setUser({
        name: 'John Doe',
        email: 'john@example.com',
        rating: reviewsResponse.averageRating || 0,
        totalRatings: reviewsResponse.totalReviews || 0,
        trustScore: 85,
        completedTransactions: 12,
        successfulTransactions: 11
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} filled={i < rating}>
        ★
      </Star>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingSpinner>Loading profile...</LoadingSpinner>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <EmptyState>
          <h3>User not found</h3>
        </EmptyState>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileImage>
          {user.name.charAt(0).toUpperCase()}
        </ProfileImage>
        <ProfileInfo>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
          <TrustScore>
            <span>Trust Score:</span>
            <TrustScoreValue score={user.trustScore}>
              {user.trustScore}/100
            </TrustScoreValue>
            <TrustScoreBar>
              <TrustScoreFill score={user.trustScore} />
            </TrustScoreBar>
          </TrustScore>
        </ProfileInfo>
      </ProfileHeader>

      <StatsGrid>
        <StatCard>
          <StatValue>{user.rating.toFixed(1)}</StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{user.totalRatings}</StatValue>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{user.completedTransactions}</StatValue>
          <StatLabel>Completed Transactions</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {user.completedTransactions > 0 
              ? Math.round((user.successfulTransactions / user.completedTransactions) * 100)
              : 0}%
          </StatValue>
          <StatLabel>Success Rate</StatLabel>
        </StatCard>
      </StatsGrid>

      <Tabs>
        <Tab 
          active={activeTab === 'reviews'} 
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviews.length})
        </Tab>
        <Tab 
          active={activeTab === 'ratings'} 
          onClick={() => setActiveTab('ratings')}
        >
          Ratings ({ratings.length})
        </Tab>
      </Tabs>

      <TabContent>
        {activeTab === 'reviews' && (
          <ReviewsList>
            {reviews.length === 0 ? (
              <EmptyState>
                <h3>No reviews yet</h3>
                <p>This user hasn't received any reviews yet.</p>
              </EmptyState>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review._id}>
                  <ReviewHeader>
                    <ReviewAuthor>
                      <AuthorImage>
                        {review.reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                      </AuthorImage>
                      <AuthorInfo>
                        <AuthorName>
                          {review.isAnonymous ? 'Anonymous' : review.reviewer?.name || 'Unknown'}
                        </AuthorName>
                        <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                      </AuthorInfo>
                    </ReviewAuthor>
                    <ReviewRating>
                      {renderStars(review.rating)}
                    </ReviewRating>
                  </ReviewHeader>
                  
                  <ReviewTitle>{review.title}</ReviewTitle>
                  <ReviewContent>{review.content}</ReviewContent>
                  
                  <ReviewActions>
                    <HelpfulButton>
                      👍 Helpful ({review.helpfulVotes})
                    </HelpfulButton>
                  </ReviewActions>

                  {review.response && (
                    <ResponseCard>
                      <ResponseHeader>
                        Response from {user.name}
                      </ResponseHeader>
                      <ResponseContent>{review.response.content}</ResponseContent>
                    </ResponseCard>
                  )}
                </ReviewCard>
              ))
            )}
          </ReviewsList>
        )}

        {activeTab === 'ratings' && (
          <ReviewsList>
            {ratings.length === 0 ? (
              <EmptyState>
                <h3>No ratings yet</h3>
                <p>This user hasn't received any ratings yet.</p>
              </EmptyState>
            ) : (
              ratings.map((rating) => (
                <ReviewCard key={rating._id}>
                  <ReviewHeader>
                    <ReviewAuthor>
                      <AuthorImage>
                        {rating.rater?.name?.charAt(0).toUpperCase() || 'U'}
                      </AuthorImage>
                      <AuthorInfo>
                        <AuthorName>
                          {rating.isAnonymous ? 'Anonymous' : rating.rater?.name || 'Unknown'}
                        </AuthorName>
                        <ReviewDate>{formatDate(rating.createdAt)}</ReviewDate>
                      </AuthorInfo>
                    </ReviewAuthor>
                    <ReviewRating>
                      {renderStars(rating.rating)}
                    </ReviewRating>
                  </ReviewHeader>
                  
                  {rating.comment && (
                    <ReviewContent>{rating.comment}</ReviewContent>
                  )}
                </ReviewCard>
              ))
            )}
          </ReviewsList>
        )}
      </TabContent>
    </ProfileContainer>
  );
};

export default UserProfile;
