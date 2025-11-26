import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ErrorBoundary } from "../../../../components/molecules/ErrorBoundary/ErrorBoundary";

export const PartsRequestList = ({
  data = [],
  columns = [],
  loading = false,
  pagination,
  onPageChange,
  onRefresh,
}) => {
  const totalRecords = pagination?.totalRecords ?? data.length;
  const currentPage = pagination?.pageNumber ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

  return (
    <ErrorBoundary>
      <div className="warranty-claim-list-view">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 className="size-h1">Parts Requests</h1>
        </div>

        {loading ? (
          <div
            className="loading-container"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <LoadingSpinner size="lg" />
            <p>Loading...</p>
          </div>
        ) : (data || []).length === 0 ? (
          <div
            className="empty-state"
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            <p>No requests found</p>
          </div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            isLoading={loading}
            pagination={true}
            serverSide={true}
            totalRecords={totalRecords}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
            sortable={true}
            hoverable={true}
            striped={true}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

PartsRequestList.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default PartsRequestList;
