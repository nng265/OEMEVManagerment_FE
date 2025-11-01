// src/features/warranty/components/WarrantyClaimListView.jsx
import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../../components/molecules/ErrorBoundary/ErrorBoundary";
import { WarrantyClaimDetailModal } from "./WarrantyClaimDetailModal";
import { AssignTechnicianModal } from "./AssignTechnicianModal";
import { PendingConfirmationModal } from "./PendingConfirmationModal";
import { ApprovedClaimModal } from "./ApprovedClaimModal";
import { DeniedOrRepairedClaimModal } from "./DeniedOrRepairedClaimModal";
import { CarBackHomeModal } from "./CarBackHomeModal";
import { SentToManufacturerModal } from "./SentToManufacturerModal";
import { UnderInspectionModal } from "./UnderInspectionModal";
import { UnderRepairModal } from "./UnderRepairModal";
import { DoneWarrantyModal } from "./DoneWarrantyModal";
import "./WarrantyClaimListView.css";

export const WarrantyClaimListView = ({
  // Dữ liệu props
  data,
  columns,
  loading,
  error,
  pagination,
  onPageChange,

  // Filter props
  statusFilter,
  onStatusFilterChange,
  statusOptions,

  // Modal state và handlers
  selectedClaim,
  showDetailModal,
  onCloseDetailModal,
  showAssignModal,
  onCloseAssignModal,
  onAssignSubmit,
  
  // Status-specific modals
  showPendingConfirmationModal,
  onClosePendingConfirmationModal,
  showApprovedModal,
  onCloseApprovedModal,
  showDeniedOrRepairedModal,
  onCloseDeniedOrRepairedModal,
  showCarBackHomeModal,
  onCloseCarBackHomeModal,
  showSentToManufacturerModal,
  onCloseSentToManufacturerModal,
  showUnderInspectionModal,
  onCloseUnderInspectionModal,
  showUnderRepairModal,
  onCloseUnderRepairModal,
  showDoneWarrantyModal,
  onCloseDoneWarrantyModal,
  
  onAction,
  
  technicians,
  onFetchTechnicians,
  loadingTechnicians,
  
  // Assigned technicians (for under inspection/repair)
  assignedTechnicians,
  loadingAssignedTechs,
}) => {
  return (
    <ErrorBoundary>
      <div className="warranty-claim-list-view">
        {/* Header with Filter */}
        <div className="warranty-claim-header">
          <h1>Warranty Claims List</h1>
          <div className="warranty-filter-container">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              {(statusOptions || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Handle Loading / Error / Empty / Data */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="lg" />
            <p>Loading data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle" />
            {error}
          </div>
        ) : (data || []).length === 0 ? (
          <div className="empty-state">
            <p>No warranty claims found</p>
            {statusFilter && statusOptions && (
              <p>
                for status "
                {statusOptions.find((o) => o.value === statusFilter)?.label ||
                  statusFilter}
                "
              </p>
            )}
          </div>
        ) : (
          // Render DataTable when data available
          <DataTable
            data={data}
            columns={columns}
            isLoading={false} // Loading handled outside
            // onRowClick={onRowClick} // Remove if only using buttons in 'actions' column
            noDataMessage="No warranty claims found" // For filter/search with no results
            // Enable DataTable features
            searchable={true}
            pagination={true}
            serverSide={true}
            totalRecords={pagination?.totalRecords ?? data.length}
            currentPage={pagination?.pageNumber ?? 0}
            pageSize={pagination?.pageSize ?? 10}
            onPageChange={onPageChange}
            sortable={true}
            hoverable={true}
            striped={true}
          />
        )}

        {/* Các Modals */}
        {showDetailModal && selectedClaim && (
          <WarrantyClaimDetailModal
            isOpen={showDetailModal}
            onClose={onCloseDetailModal}
            warrantyData={selectedClaim}
          />
        )}

        {showAssignModal && selectedClaim && (
          <AssignTechnicianModal
            isOpen={showAssignModal}
            onClose={onCloseAssignModal}
            onSubmit={onAssignSubmit}
            claimData={selectedClaim}
          />
        )}

        {showPendingConfirmationModal && selectedClaim && (
          <PendingConfirmationModal
            isOpen={showPendingConfirmationModal}
            onClose={onClosePendingConfirmationModal}
            warrantyData={selectedClaim}
            onAction={onAction}
            technicians={technicians}
            onFetchTechnicians={onFetchTechnicians}
            isLoadingTechnicians={loadingTechnicians}
          />
        )}

        {showApprovedModal && selectedClaim && (
          <ApprovedClaimModal
            isOpen={showApprovedModal}
            onClose={onCloseApprovedModal}
            warrantyData={selectedClaim}
            onAction={onAction}
          />
        )}

        {showDeniedOrRepairedModal && selectedClaim && (
          <DeniedOrRepairedClaimModal
            isOpen={showDeniedOrRepairedModal}
            onClose={onCloseDeniedOrRepairedModal}
            warrantyData={selectedClaim}
            onAction={onAction}
          />
        )}

        {showCarBackHomeModal && selectedClaim && (
          <CarBackHomeModal
            isOpen={showCarBackHomeModal}
            onClose={onCloseCarBackHomeModal}
            warrantyData={selectedClaim}
            onAction={onAction}
          />
        )}

        {showSentToManufacturerModal && selectedClaim && (
          <SentToManufacturerModal
            isOpen={showSentToManufacturerModal}
            onClose={onCloseSentToManufacturerModal}
            warrantyData={selectedClaim}
          />
        )}

        {showUnderInspectionModal && selectedClaim && (
          <UnderInspectionModal
            isOpen={showUnderInspectionModal}
            onClose={onCloseUnderInspectionModal}
            warrantyData={selectedClaim}
            assignedTechnicians={assignedTechnicians}
            loadingAssignedTechs={loadingAssignedTechs}
          />
        )}

        {showUnderRepairModal && selectedClaim && (
          <UnderRepairModal
            isOpen={showUnderRepairModal}
            onClose={onCloseUnderRepairModal}
            warrantyData={selectedClaim}
            assignedTechnicians={assignedTechnicians}
            loadingAssignedTechs={loadingAssignedTechs}
          />
        )}

        {showDoneWarrantyModal && selectedClaim && (
          <DoneWarrantyModal
            isOpen={showDoneWarrantyModal}
            onClose={onCloseDoneWarrantyModal}
            warrantyData={selectedClaim}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

// PropTypes để kiểm tra kiểu dữ liệu props
WarrantyClaimListView.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  statusOptions: PropTypes.array,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  selectedClaim: PropTypes.object,
  showDetailModal: PropTypes.bool.isRequired,
  onCloseDetailModal: PropTypes.func.isRequired,
  showAssignModal: PropTypes.bool.isRequired,
  onCloseAssignModal: PropTypes.func.isRequired,
  onAssignSubmit: PropTypes.func.isRequired,
  
  // Status-specific modals
  showPendingConfirmationModal: PropTypes.bool.isRequired,
  onClosePendingConfirmationModal: PropTypes.func.isRequired,
  showApprovedModal: PropTypes.bool.isRequired,
  onCloseApprovedModal: PropTypes.func.isRequired,
  showDeniedOrRepairedModal: PropTypes.bool.isRequired,
  onCloseDeniedOrRepairedModal: PropTypes.func.isRequired,
  showCarBackHomeModal: PropTypes.bool.isRequired,
  onCloseCarBackHomeModal: PropTypes.func.isRequired,
  showSentToManufacturerModal: PropTypes.bool.isRequired,
  onCloseSentToManufacturerModal: PropTypes.func.isRequired,
  showUnderInspectionModal: PropTypes.bool.isRequired,
  onCloseUnderInspectionModal: PropTypes.func.isRequired,
  showUnderRepairModal: PropTypes.bool.isRequired,
  onCloseUnderRepairModal: PropTypes.func.isRequired,
  showDoneWarrantyModal: PropTypes.bool.isRequired,
  onCloseDoneWarrantyModal: PropTypes.func.isRequired,
  
  onAction: PropTypes.func.isRequired,
  technicians: PropTypes.array,
  onFetchTechnicians: PropTypes.func,
  loadingTechnicians: PropTypes.bool,
  assignedTechnicians: PropTypes.array,
  loadingAssignedTechs: PropTypes.bool,
};

export default WarrantyClaimListView;
