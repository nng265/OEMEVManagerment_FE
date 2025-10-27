// src/features/partsRequest/components/PartsRequestList.jsx
import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../components/molecules/ErrorBoundary/ErrorBoundary";
import "../../warranty/components/WarrantyClaimListView.css";

export const PartsRequestList = ({ data, columns, loading, error }) => {
  return (
    <ErrorBoundary>
      <div className="warranty-claim-list-view">
        <h2>Parts Requests</h2>
        <p>Request and track parts from manufacturer</p>

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="lg" />
            <p>Loading parts requests...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (data || []).length === 0 ? (
          <div className="empty-state">
            <p>No parts requests found</p>
          </div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            isLoading={false}
            noDataMessage="No requests found matching your criteria"
            searchable={true}
            pagination={true}
            sortable={true}
            hoverable={true}
            striped={true}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

PartsRequestList.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default PartsRequestList;
