import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { formatDate } from "../../../../services/helpers";
import "./PartList.css";

// Default fallback status options (used only when container doesn't provide dynamic list)
const DEFAULT_STATUS_OPTIONS = [
  "Pending",
  "Waiting",
  "Confirmed",
  "In Transit",
  "Delivered",
  "Done",
  "Cancelled",
  "Returning",
  "Return Inspection",
  "Discrepancy Review",
];

export default function PartList({
  data = [],
  loading = false,
  error = null,
  onView,
  pagination,
  onPageChange,
  onRefresh,
  refreshing = false,
  searchQuery = "",
  onSearchChange,
  statusFilter = "",
  onStatusFilterChange,
  // dynamic statuses provided by container: array of {value,label} or array of strings
  statusOptions = [],
  loadingStatuses = false,
  statusesError = "",
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
        const normalized = (value || "unknown").trim().toLowerCase();
        const statusClass = normalized.replace(/\s+/g, "-");
        const text = value ? value : "Unknown";
        return (
          <span className={`status-badge status-${statusClass}`}>{text}</span>
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
            style={{ width: 22 }}
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
    <div style={{ padding: 18, background: "#ffffff" }}>
      <h1 className="size-p1">Parts Requests from Service Centers</h1>

      {/* Search + Status Filter */}
      <div
        className="pl-search-filter"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 2 }}>
          <Input
            type="text"
            placeholder="Search by Service Center Name..."
            value={searchQuery || ""}
            onChange={onSearchChange}
            fullWidth
            size="md"
          />
        </div>

        <div style={{ flex: 1, maxWidth: 220 }}>
          <Input
            type="select"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={(() => {
              const base = [{ value: "", label: "All Status" }];
              if (Array.isArray(statusOptions) && statusOptions.length > 0) {
                const mapped = statusOptions
                  .map((s) => {
                    if (!s) return null;
                    if (typeof s === "string") return { value: s, label: s };
                    if (typeof s === "object")
                      return {
                        value: s.value ?? s.label ?? "",
                        label: s.label ?? s.value ?? "",
                      };
                    return null;
                  })
                  .filter(Boolean);
                return base.concat(mapped);
              }
              return base.concat(
                DEFAULT_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))
              );
            })()}
            fullWidth
            size="md"
          />
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {loading && (
          <div className="pl-table-loading">
            <LoadingSpinner size="lg" />
            <p className="pl-loading-msg">Loading parts requests...</p>
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

PartList.propTypes = {
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
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
};
