// src/features/warranty/components/UnderInspectionModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { WarrantyClaimDetailModal } from './WarrantyClaimDetailModal';

/**
 * Modal for "Under Inspection" status
 * Read-only modal - only shows Back button (left side)
 */
export const UnderInspectionModal = ({ 
  isOpen, 
  onClose, 
  warrantyData,
  assignedTechnicians = [],
  loadingAssignedTechs = false
}) => {
  // Assigned Technicians Section
  const assignedTechniciansSection = (
    <div className="detail-section assigned-technicians-section">
      <h4>Assigned Technicians</h4>
      {loadingAssignedTechs ? (
        <p className="loading-text">Loading assigned technicians...</p>
      ) : assignedTechnicians.length > 0 ? (
        <div className="technicians-list">
          {assignedTechnicians.map((tech, index) => (
            <div key={tech.userId || index} className="technician-item">
              <div className="technician-icon">👤</div>
              <div className="technician-info">
                <span className="technician-name">{tech.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-technicians">No technicians assigned yet.</p>
      )}
    </div>
  );

  return (
    <WarrantyClaimDetailModal
      isOpen={isOpen}
      onClose={onClose}
      warrantyData={warrantyData}
      showBackButton={true}
      backButtonLabel="Back"
      additionalContent={assignedTechniciansSection}
    >
      {/* No action buttons - only Back button will show on the left */}
    </WarrantyClaimDetailModal>
  );
};

UnderInspectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
  assignedTechnicians: PropTypes.array,
  loadingAssignedTechs: PropTypes.bool
};
