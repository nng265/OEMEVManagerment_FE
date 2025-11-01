import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { formatDate } from "../../../../services/helpers";

export const EVMStaffWarrantyList = ({
  data = [],
  loading = false,
  error = null,
  onView,
  pagination,
  onPageChange,
}) => {
  // ✅ Cấu hình cột hiển thị trong bảng
  const columns = [
    { key: "vin", label: "VIN" },
    { key: "model", label: "Model" },
    {
      key: "createdDate",
      label: "Created Date",
      render: (val) =>
        val
          ? formatDate(val, "en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
    },
    {
      key: "description",
      label: "Claim Description",
      render: (val) =>
        val && val.length > 80 ? `${val.slice(0, 80)}...` : val || "-",
    },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(row.raw);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const rows = data.map((item) => ({
    id: item.claimId,
    vin: item.vin || "-",
    model: item.model || "-",
    year: item.year || "-",
    customerName: item.customerName || "-",
    customerPhoneNumber: item.customerPhoneNumber || "-",
    createdDate: item.createdDate || "",
    failureDesc: item.failureDesc || "-",
    description: item.description || "-",
    status: item.status || "-",
    showPolicy: item.showPolicy || [],
    showClaimParts: item.showClaimParts || [],
    attachments: item.attachments || [],
    raw: item,
  }));

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ marginBottom: 12 }}>Sent To Manufacturer Claims</h2>

      <div style={{ position: "relative" }}>
        {loading && (
          <div className="data-table-loading">
            <LoadingSpinner size="lg" />
            <p className="data-table-loading-message">
              Loading warranty claims...
            </p>
          </div>
        )}

        <DataTable
          data={rows}
          columns={columns}
          searchable={false}
          pagination
          serverSide
          totalRecords={pagination?.totalRecords ?? rows.length}
          currentPage={pagination?.pageNumber ?? 0}
          pageSize={pagination?.pageSize ?? 10}
          onPageChange={onPageChange}
          exportable={false}
          noDataMessage={error || "No claims found"}
        />
      </div>
    </div>
  );
};

EVMStaffWarrantyList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onView: PropTypes.func,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
};

export default EVMStaffWarrantyList;
