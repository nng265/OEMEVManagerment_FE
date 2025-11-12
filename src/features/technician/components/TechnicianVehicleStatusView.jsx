import React from "react";
import PropTypes from "prop-types";
import { Input } from "../../../components/atoms/Input/Input";
import { DataTable } from "../../../components/organisms";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../components/molecules/ErrorBoundary/ErrorBoundary";
import { WorkOrderDetailModal } from "./WorkOrderDetailModal";

import "./TechnicianVehicleStatusView.css";

export const TechnicianVehicleStatusView = ({
  data,
  columns,
  loading,
  error,
  pagination,
  onPageChange,
  onRefresh,
  refreshing = false,

  // Filter props
  searchQuery = "",
  onSearchChange,
  targetFilter = "",
  onTargetFilterChange,
  typeFilter = "",
  onTypeFilterChange,

  // 2. NHẬN CÁC PROPS TỪ CONTAINER
  selectedWorkOrder,
  showDetailModal,
  onCloseDetailModal,

  categories,
  models,
  serials,
  fetchCategories,
  fetchModels,
  fetchSerial,
  fetchCategoryByModel,

  uploadImages,
  submitInspection,
  submitRepair,
}) => {
  // Target options (warranty/campaign)
  const targetOptions = [
    { value: "", label: "All Targets" },
    { value: "Warranty", label: "Warranty" },
    { value: "Campaign", label: "Campaign" },
  ];

  // Type options (inspection/repair)
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Inspection", label: "Inspection" },
    { value: "Repair", label: "Repair" },
  ];

  return (
    <ErrorBoundary>
      <div className="technician-status-view">
        {/* Header */}
        <div className="technician-status-header">
          <h2>Assigned Work Orders</h2>
        </div>

        {/* Search Bar and Filters */}
        <div className="work-order-filters" style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end" }}>
          <div style={{ flex: 2 }}>
            <Input
              type="text"
              placeholder="Search by VIN..."
              value={searchQuery}
              onChange={onSearchChange}
              fullWidth
              size="md"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              type="select"
              value={targetFilter}
              onChange={onTargetFilterChange}
              options={targetOptions}
              fullWidth
              size="md"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              type="select"
              value={typeFilter}
              onChange={onTypeFilterChange}
              options={typeOptions}
              fullWidth
              size="md"
            />
          </div>
        </div>

        {/* Handle Loading / Error / Empty / Data */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="lg" />
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
          <DataTable
            data={data}
            columns={columns}
            isLoading={false}
            noDataMessage="No work orders"
            searchable
            pagination
            serverSide
            totalRecords={pagination?.totalRecords ?? data.length}
            currentPage={pagination?.pageNumber ?? 0}
            pageSize={pagination?.pageSize ?? 10}
            onPageChange={onPageChange}
            hoverable
            striped
            loadingMessage="Loading work orders..."
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}

        {/* 3. RENDER MODAL KHI STATE LÀ TRUE */}
        {showDetailModal && selectedWorkOrder && (
          <WorkOrderDetailModal
            key={selectedWorkOrder.workOrderId} // ✅ thêm key để React refresh modal khi đổi task
            isOpen={showDetailModal}
            onClose={onCloseDetailModal}
            workOrderData={selectedWorkOrder} // Prop này khớp với file WorkOrderDetailModal.jsx
            categories={categories}
            models={models}
            serials={serials}
            fetchCategories={fetchCategories}
            fetchModels={fetchModels}
            fetchSerial={fetchSerial}
            fetchCategoryByModel={fetchCategoryByModel}
            // truyền handlers xuống modal (container giữ network logic)
            uploadImages={uploadImages}
            submitInspection={submitInspection}
            submitRepair={submitRepair}
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
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  // Filter prop types
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  targetFilter: PropTypes.string,
  onTargetFilterChange: PropTypes.func,
  typeFilter: PropTypes.string,
  onTypeFilterChange: PropTypes.func,
  // Thêm prop types cho modal
  selectedWorkOrder: PropTypes.object,
  showDetailModal: PropTypes.bool,
  onCloseDetailModal: PropTypes.func,
  categories: PropTypes.array,
  models: PropTypes.array,
  serials: PropTypes.array,
  fetchCategories: PropTypes.func,
  fetchModels: PropTypes.func,
  fetchSerial: PropTypes.func,
  fetchCategoryByModel: PropTypes.func,
  uploadImages: PropTypes.func,
  submitInspection: PropTypes.func,
  submitRepair: PropTypes.func,
};

export default TechnicianVehicleStatusView;
