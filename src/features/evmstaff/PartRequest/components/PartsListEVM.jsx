import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { formatDate } from "../../../../services/helpers";
import "./PartsListEVM.css";

export default function PartsListEVM({
  data = [],
  loading = false,
  error = null,
  onView,
  pagination,
  onPageChange,
  onRefresh,
  refreshing = false,
}) {
  const items = Array.isArray(data)
    ? data
    : data?.data?.items ?? data?.items ?? [];

  const columns = [
    { key: "serviceCenterName", label: "Service Center" },
    { key: "createdByName", label: "Requested By" },
    {
      key: "totalItems",
      label: "Items",
      render: (val, row) =>
        row.raw.partOrderItems?.length
          ? row.raw.partOrderItems.length
          : val || 0,
    },
    {
      key: "requestDate",
      label: "Requested Date",
      render: (val) =>
        val
          ? formatDate(val, "en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          : "-",
    },
    {
      key: "expectedDate",
      label: "Expected Delivery",
      render: (val) =>
        val
          ? formatDate(val, "en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          : "-",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
        const normalizedStatus = (value || "unknown").trim().toLowerCase();
        const statusClass = normalizedStatus.replace(/\s+/g, "-");
        const displayText =
          value && value.length > 0
            ? value.charAt(0).toUpperCase() + value.slice(1)
            : "Unknown";

        return (
          <span className={`status-badge status-${statusClass}`}>
            {displayText}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="light"
          size="sm"
          onClick={() => onView && onView(row.raw)}
        >
          <img
            src="../../../../../public/eye.png"
            className="eye-svg"
            style={{ width: "22px" }}
          />
        </Button>
      ),
    },
  ];

  const rows =
    items.map((p) => ({
      orderId: p.orderId || "-",
      serviceCenterName: p.serviceCenterName || "-",
      createdByName: p.createdByName || "-",
      totalItems: p.totalItems || (p.partOrderItems?.length ?? 0),
      status: p.status || "-",
      requestDate: p.requestDate || "",
      expectedDate: p.expectedDate || p.partDelivery || "",
      raw: {
        ...p,
        serviceCenter: p.serviceCenterName || "-",
        requestedBy: p.createdByName,
        requestedDate: p.requestDate,
        expectedDate: p.expectedDate || p.partDelivery || "",
        deliveredDate: p.deliveredDate || "",
        partOrderItems: p.partOrderItems,
        parts: p.partOrderItems?.map((x) => ({
          model: x.model,
          requestedQty: x.requestedQty || x.quantity || 0,
          oemStock: x.oemStock || 0,
          scStock: x.scStock || 0,
        })),
        notes: p.remarks,
      },
    })) ?? [];

  return (
    <div style={{ padding: 8 }}>
      <h1 style={{ marginBottom: 30, marginTop: 30 }}>
        Parts Requests from Service Centers
      </h1>
      <div style={{ position: "relative" }}>
        {loading && (
          <div className="data-table-loading">
            <LoadingSpinner size="lg" />
            <p className="data-table-loading-message">
              Loading parts requests...
            </p>
          </div>
        )}
        <DataTable
          data={rows}
          columns={columns}
          searchable
          pagination
          serverSide
          totalRecords={pagination?.totalRecords ?? rows.length}
          currentPage={pagination?.pageNumber ?? 0}
          pageSize={pagination?.pageSize ?? 10}
          onPageChange={onPageChange}
          exportable={false}
          noDataMessage={error || "No parts requests found"}
          selectable={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
}

PartsListEVM.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onView: PropTypes.func,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
};
