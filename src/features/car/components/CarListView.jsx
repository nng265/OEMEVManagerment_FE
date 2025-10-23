// src/features/car/components/CarListView.jsx
import React from 'react';
import { LoadingSpinner } from '../../../components/atoms/LoadingSpinner/LoadingSpinner'; // Giữ lại import này
import { ErrorBoundary } from '../../../components/molecules/ErrorBoundary/ErrorBoundary';
import { VehicleDetailModal } from './VehicleDetailModal';
import { CreateWarrantyClaimModal } from './CreateWarrantyClaimModal';
import { DataTable } from '../../../components/organisms';
import './CarListView.css';
// Import CSS của warranty để dùng chung class loading/error/empty
// Hoặc bạn có thể chép các class đó vào CarListView.css
import '../../warranty/components/WarrantyClaimListView.css';

export const CarListView = ({
  vehicles,
  columns,
  loading,
  error,
  selectedVehicle,
  showDetailModal,
  showWarrantyModal,
  onWarrantySubmit,
  onCloseDetailModal,
  onCloseWarrantyModal
}) => {

  return (
    <ErrorBoundary>
      <div className="car-list-view">
        <h2>Vehicle List</h2>

        {/* --- HANDLE LOADING / ERROR / EMPTY STATE OUTSIDE DATATABLE --- */}
        {loading ? (
          <div className="loading-container"> {/* Use same class as warranty */}
            <LoadingSpinner size="lg"/> {/* Option: Larger spinner */}
            <p>Loading vehicle list...</p>
          </div>
        ) : error ? (
          <div className="error-message"> {/* Keep error handling the same */}
            <i className="fas fa-exclamation-circle" /> {/* Error icon if available */}
            {error}
          </div>
        // Add fallback for vehicles and check length
        ) : (vehicles || []).length === 0 ? (
            <div className="empty-state"> {/* Use same class as warranty */}
                <p>No vehicles found</p>
                {/* Can add other context here if needed */}
            </div>
        ) : (
          // --- RENDER DATATABLE WHEN NOT LOADING/ERROR/EMPTY ---
          <DataTable
            data={vehicles}
            columns={columns}
            isLoading={false} // <-- SET TO FALSE, loading handled outside
            noDataMessage="No vehicles found" // Use when filter/search has no results

            // DataTable features still enabled
            searchable={true}
            pagination={true}
            sortable={true}
            hoverable={true}
            striped={true}
          />
        )}
        {/* -------------------------------------------------------- */}

        {/* Keep modals the same */}
        {/* Add selectedVehicle check for safety */}
        {showDetailModal && selectedVehicle && (
            <VehicleDetailModal
              show={showDetailModal} // Original modal props may be show/hide
              onHide={onCloseDetailModal}
              vehicle={selectedVehicle}
            />
        )}

        {showWarrantyModal && selectedVehicle && (
            <CreateWarrantyClaimModal
              show={showWarrantyModal} // Original modal props may be show/hide
              onHide={onCloseWarrantyModal}
              vehicle={selectedVehicle}
              onSubmit={onWarrantySubmit}
            />
        )}
      </div>
    </ErrorBoundary>
  );
};

// Thêm PropTypes nếu muốn
// CarListView.propTypes = { ... };

export default CarListView;