import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../components/molecules/ErrorBoundary/ErrorBoundary";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { CreateWarrantyClaimModal } from "./CreateWarrantyClaimModal";
import "./CarListView.css";

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
  onCloseWarrantyModal,
  pagination,
  onPageChange,
}) => {
  return (
    <div className="car-list-view">
      <h2>Vehicles</h2>

      {/* --- Loading --- */}
      {loading && (
        <div className="text-center my-4">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* --- Error --- */}
      {!loading && error && (
        <div className="text-danger text-center my-3">{error}</div>
      )}

      {/* --- Data Table --- */}
      {!loading && !error && (
        <ErrorBoundary>
          <DataTable
            data={vehicles}
            columns={columns}
            isLoading={loading}
            serverSide
            pagination
            totalRecords={pagination?.totalRecords ?? vehicles.length}
            currentPage={pagination?.pageNumber ?? 0}
            pageSize={pagination?.pageSize ?? 10}
            onPageChange={onPageChange}
            noDataMessage="No vehicles found."
            responsive
            hoverable
            striped
          />
        </ErrorBoundary>
      )}

      {/* --- Vehicle Detail Modal --- */}
      {showDetailModal && selectedVehicle && (
        <VehicleDetailModal
          show={showDetailModal}
          vehicle={selectedVehicle}
          onClose={onCloseDetailModal}
        />
      )}

      {/* --- Create Warranty Claim Modal --- */}
      {showWarrantyModal && selectedVehicle && (
        <CreateWarrantyClaimModal
          show={showWarrantyModal}
          vehicle={selectedVehicle}
          onClose={onCloseWarrantyModal}
          onSubmit={onWarrantySubmit}
        />
      )}
    </div>
  );
};

CarListView.propTypes = {
  vehicles: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  selectedVehicle: PropTypes.object,
  showDetailModal: PropTypes.bool,
  showWarrantyModal: PropTypes.bool,
  onWarrantySubmit: PropTypes.func,
  onCloseDetailModal: PropTypes.func,
  onCloseWarrantyModal: PropTypes.func,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
};
