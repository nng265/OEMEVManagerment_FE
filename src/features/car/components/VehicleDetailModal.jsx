import React from 'react';
import { Modal } from '../../../components/molecules/Modal/Modal';
import { DetailSection } from '../../../components/molecules/DetailSection/DetailSection';
import { DetailModalActions } from '../../../components/molecules/DetailModalActions/DetailModalActions';
import { WarrantyRecordsSection } from '../../../components/molecules/WarrantyRecordsSection/WarrantyRecordsSection';

export const VehicleDetailModal = ({ show, onHide, vehicle }) => {
  if (!vehicle) return null;

  return (
    <Modal 
      isOpen={show} 
      onClose={onHide}
      title="Vehicle Details"
      size="lg"
      showFooter={false}
    >
      <DetailSection title="Vehicle Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">VIN:</span>
            <span className="value">{vehicle.vin}</span>
          </div>
          <div className="detail-item">
            <span className="label">Model:</span>
            <span className="value">{vehicle.model}</span>
          </div>
          <div className="detail-item">
            <span className="label">Year:</span>
            <span className="value">{vehicle.year}</span>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Customer Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{vehicle.customerName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">{vehicle.customerPhoneNunmber}</span>
          </div>
          <div className="detail-item">
            <span className="label">Customer ID:</span>
            <span className="value">{vehicle.customerId}</span>
          </div>
        </div>
      </DetailSection>

      <WarrantyRecordsSection warrantyRecords={vehicle.policyInformation} />

      <DetailModalActions onBack={onHide} backLabel="Close" />
    </Modal>
  );
};
