// src/features/partsRequest/components/PartsRequestList.jsx
import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../../components/molecules/ErrorBoundary/ErrorBoundary";

export const PartsRequestList = ({
  data = [],
  columns = [],
  loading = false,
  error,
  pagination,
  onPageChange,
}) => {
  const totalRecords = pagination?.totalRecords ?? data.length;
  const currentPage = pagination?.pageNumber ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

  return (
    <ErrorBoundary>
      <div className="warranty-claim-list-view">
        <h1 className="size-h1">Parts Requests</h1>

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
            isLoading={loading}
            noDataMessage={error || "No requests found matching your criteria"}
            searchable={true}
            pagination={true}
            serverSide={true}
            totalRecords={totalRecords}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
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
  loading: PropTypes.bool,
  error: PropTypes.string,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
};

export default PartsRequestList;
