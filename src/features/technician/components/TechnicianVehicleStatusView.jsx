// src/features/technician/components/TechnicianVehicleStatusView.jsx
import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../components/molecules/ErrorBoundary/ErrorBoundary";
import { WorkOrderDetailModal } from "./WorkOrderDetailModal"; // <-- 1. IMPORT MODAL

// Import CSS cần thiết
// import "../../warranty/components/WarrantyClaimListView.css";
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
