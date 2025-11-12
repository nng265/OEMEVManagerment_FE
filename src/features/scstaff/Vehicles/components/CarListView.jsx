import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../../components/molecules/ErrorBoundary/ErrorBoundary";
import { Input } from "../../../../components/atoms/Input/Input";
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
  onRefresh,
  refreshing = false,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="car-list-view">
      <h1 className="size-h1">Vehicles</h1>

      {/* --- Search Bar --- */}
      <div className="search-bar-wrapper" style={{ marginBottom: "20px" }}>
        <Input
          type="text"
          placeholder="Search by VIN, Model, Customer Name, or Phone..."
          value={searchQuery}
          onChange={onSearchChange}
          fullWidth
          size="md"
        />
      </div>

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
            onRefresh={onRefresh}
            refreshing={refreshing}
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
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
};
