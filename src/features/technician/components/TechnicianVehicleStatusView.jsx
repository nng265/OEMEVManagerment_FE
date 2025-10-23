// src/features/technician/components/TechnicianVehicleStatusView.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '../../../components/organisms';
import { LoadingSpinner } from '../../../components/atoms/LoadingSpinner/LoadingSpinner';
import { ErrorBoundary } from '../../../components/molecules/ErrorBoundary/ErrorBoundary';
import { WorkOrderDetailModal } from './WorkOrderDetailModal'; // <-- 1. IMPORT MODAL

// Import CSS cần thiết
import '../../warranty/components/WarrantyClaimListView.css';
import './TechnicianVehicleStatusView.css';

export const TechnicianVehicleStatusView = ({
  data,
  columns,
  loading,
  error,
  
  // 2. NHẬN CÁC PROPS TỪ CONTAINER
  selectedWorkOrder,
  showDetailModal,
  onCloseDetailModal,
}) => {

  return (
    <ErrorBoundary>
      <div className="technician-status-view">
        {/* Header */}
        <div className="technician-status-header">
          <h2>Assigned Work Orders</h2>
        </div>

        {/* Handle Loading / Error / Empty / Data */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="lg"/>
            <p>Loading work orders...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle" />
            {error}
          </div>
        ) : (data || []).length === 0 ? (
            <div className="empty-state">
                <p>You have no assigned work orders yet.</p>
            </div>
        ) : (
          // Render DataTable
          <DataTable
            data={data}
            columns={columns}
            isLoading={false}
            noDataMessage="No work orders"
            searchable={true}
            pagination={true}
            sortable={true}
            hoverable={true}
            striped={true}
          />
        )}

        {/* 3. RENDER MODAL KHI STATE LÀ TRUE */}
        {showDetailModal && selectedWorkOrder && (
          <WorkOrderDetailModal
            isOpen={showDetailModal}
            onClose={onCloseDetailModal}
            workOrderData={selectedWorkOrder} // Prop này khớp với file WorkOrderDetailModal.jsx
          />
        )}

      </div>
    </ErrorBoundary>
  );
};

// 4. CẬP NHẬT LẠI PROP TYPES (bỏ comment)
TechnicianVehicleStatusView.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  // Thêm prop types cho modal
  selectedWorkOrder: PropTypes.object,
  showDetailModal: PropTypes.bool,
  onCloseDetailModal: PropTypes.func,
};

export default TechnicianVehicleStatusView;