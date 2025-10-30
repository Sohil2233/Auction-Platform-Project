import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const ReviewContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin-bottom: 20px;
  color: #333;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  color: ${props => props.filled ? '#ffc107' : '#e0e0e0'};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;

  input {
    cursor: pointer;
  }
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  ` : `
    background: #e0e0e0;
    color: #333;
    &:hover { background: #d0d0d0; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
  ${props => props.success ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  ` : `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const CharCount = styled.span`
  font-size: 12px;
  color: #666;
  display: block;
  text-align: right;
  margin-top: -12px;
  margin-bottom: 16px;
`;

const ReviewComponent = ({ reviewedUserId, listingId, transactionId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setMessage({ text: 'Please select a rating', success: false });
      return;
    }

    if (title.trim().length < 5) {
      setMessage({ text: 'Title must be at least 5 characters', success: false });
      return;
    }

    if (content.trim().length < 10) {
      setMessage({ text: 'Review content must be at least 10 characters', success: false });
      return;
    }

    setLoading(true);
    setMessage({ text: '', success: false });

    try {
      await api.createReview({
        reviewedUserId,
        listingId,
        transactionId,
        rating,
        title: title.trim(),
        content: content.trim(),
        isAnonymous
      });

      setMessage({ text: 'Review submitted successfully!', success: true });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to submit review. Please try again.', 
        success: false 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContainer>
      <Title>Write a Review</Title>
      
      <InfoText>
        Share your experience with this transaction. Your review helps other users make informed decisions.
      </InfoText>

      <div>
        <StarsContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              type="button"
              filled={star <= (hoveredRating || rating)}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </Star>
          ))}
        </StarsContainer>

        <Input
          type="text"
          placeholder="Review Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <CharCount>{title.length}/100</CharCount>

        <TextArea
          placeholder="Share details about your experience with this item and the seller..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
        />
        <CharCount>{content.length}/1000</CharCount>

        <CheckboxLabel>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Submit review anonymously
        </CheckboxLabel>

        <ButtonGroup>
          <Button 
            type="button" 
            primary 
            disabled={loading || rating === 0 || title.length < 5 || content.length < 10}
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
          {onCancel && (
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </ButtonGroup>

        {message.text && (
          <Message success={message.success}>
            {message.text}
          </Message>
        )}
      </div>
    </ReviewContainer>
  );
};

export default ReviewComponent;