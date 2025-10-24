import React from 'react';
import PropTypes from 'prop-types';
import { DetailSection } from '../DetailSection/DetailSection';
import './WarrantyRecordsSection.css';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Shared component to display warranty records/policy information
 * @param {Array} warrantyRecords - Array of warranty records (policyInformation or showPolicy)
 * @param {string} status - Current warranty claim status (for conditional display)
 * @param {boolean} isApplied - Whether to show as "Applied Policies" or "Active Warranty Records"
 */
export const WarrantyRecordsSection = ({ warrantyRecords, status, isApplied = false }) => {
  if (!warrantyRecords || warrantyRecords.length === 0) return null;

  // Determine title based on context
  // For approved/later statuses in warranty feature: show applied policy
  // For others: show active warranty records
  const shouldShowAsApplied = isApplied || (status && 
    ['APPROVED', 'ASSIGNED_TECHNICIAN', 'IN_PROGRESS', 'SENT_TO_MANUFACTURER', 
     'MANUFACTURER_REPAIRED', 'REPAIRED', 'DENIED', 'CAR_BACK_HOME'].includes(status));

  const title = shouldShowAsApplied 
    ? 'Applied Warranty Policy' 
    : 'Active Warranty Records';

  return (
    <DetailSection title={title}>
      {warrantyRecords.map((record, index) => (
        <div key={index} className="policy-item">
          <h5>{record.policyName || `Policy ${index + 1}`}</h5>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Start Date:</span>
              <span className="value">{formatDate(record.startDate)}</span>
            </div>
            <div className="detail-item">
              <span className="label">End Date:</span>
              <span className="value">{formatDate(record.endDate)}</span>
            </div>
          </div>
        </div>
      ))}
    </DetailSection>
  );
};

WarrantyRecordsSection.propTypes = {
  warrantyRecords: PropTypes.arrayOf(
    PropTypes.shape({
      policyName: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    })
  ),
  status: PropTypes.string,
  isApplied: PropTypes.bool,
};

export default WarrantyRecordsSection;