import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const ReportContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h3`
  margin-bottom: 8px;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  margin-bottom: 20px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const CharCount = styled.span`
  font-size: 12px;
  color: #666;
  display: block;
  text-align: right;
  margin-bottom: 20px;
`;

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #856404;
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

  ${props => props.danger ? `
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
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

const reportTypes = [
  { value: '', label: 'Select a reason' },
  { value: 'fraud', label: '🚫 Fraud - Seller is deceiving buyers' },
  { value: 'fake_item', label: '❌ Fake Item - Item is counterfeit or misrepresented' },
  { value: 'scam', label: '⚠️ Scam - Suspected fraudulent activity' },
  { value: 'inappropriate_content', label: '🔞 Inappropriate Content' },
  { value: 'harassment', label: '😡 Harassment or Abuse' },
  { value: 'spam', label: '📧 Spam or Misleading Information' },
  { value: 'payment_issue', label: '💰 Payment Issues' },
  { value: 'shipping_issue', label: '📦 Shipping Problems' },
  { value: 'other', label: '📝 Other Issues' }
];

const ReportComponent = ({ reportedUserId, reportedListingId, onSuccess, onCancel }) => {
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', success: false });

  const handleSubmit = async () => {
    if (!reportType) {
      setMessage({ text: 'Please select a report reason', success: false });
      return;
    }

    if (reason.trim().length < 10) {
      setMessage({ text: 'Please provide at least 10 characters explaining the issue', success: false });
      return;
    }

    setLoading(true);
    setMessage({ text: '', success: false });

    try {
      await api.createReport({
        reportedUserId,
        reportedListingId,
        type: reportType,
        reason: reason.trim(),
        description: description.trim() || undefined
      });

      setMessage({ text: 'Report submitted successfully. Our team will review it shortly.', success: true });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to submit report. Please try again.', 
        success: false 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContainer>
      <Title>Report {reportedListingId ? 'Listing' : 'User'}</Title>
      <Subtitle>
        Help us maintain a safe marketplace by reporting suspicious activity, fraud, or policy violations.
      </Subtitle>

      <div>
        <Label>What's the issue?</Label>
        <Select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          {reportTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        <Label>Brief explanation (required)</Label>
        <TextArea
          placeholder="Explain the issue in detail. What happened? When did it occur?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
        <CharCount>{reason.length}/500</CharCount>

        <Label>Additional details (optional)</Label>
        <TextArea
          placeholder="Provide any additional context, evidence, or information that may help us investigate..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
        <CharCount>{description.length}/1000</CharCount>

        <WarningBox>
          ⚠️ <strong>Important:</strong> False reports may result in action against your account. 
          Please ensure your report is accurate and truthful. Our team reviews all reports carefully.
        </WarningBox>

        <ButtonGroup>
          <Button 
            danger 
            disabled={loading || !reportType || reason.length < 10}
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
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
    </ReportContainer>
  );
};

export default ReportComponent;