import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
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
  searchQuery = "",
  onSearchChange,
  statusFilter = "",
  onStatusFilterChange,
  statusOptions = [], // dynamic statuses from API (array of string or {value,label})
  onAdd,
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
        // Display mapping for corrected typos without breaking filtering
        const displayMapping = {
          "Retuen Inspection": "Return Inspection",
        };
        const original = value || "Unknown";
        const displayText = displayMapping[original] || original;

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 30,
          marginBottom: 30,
        }}
      >
        <h1 style={{ margin: 0 }}>Parts Requests from Service Centers</h1>

        <Button variant="light" onClick={onAdd}>
          <img
            src="../../../../../public/add.png"
            alt="Create Part Order"
            style={{ width: "50px" }}
          />
        </Button>
      </div>

      {/* Search Bar + Status Filter */}
      <div
        className="parts-search-filter"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: "20px",
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
            options={[
              { value: "", label: "All Status" },
              ...(Array.isArray(statusOptions) && statusOptions.length
                ? statusOptions.map((s) =>
                    typeof s === "string"
                      ? { value: s, label: s }
                      : { value: s.value, label: s.label }
                  )
                : [
                    { value: "Pending", label: "Pending" },
                    { value: "Approved", label: "Approved" },
                    { value: "Delivered", label: "Delivered" },
                    { value: "Closed", label: "Closed" },
                    { value: "In Transit", label: "In Transit" },
                  ]),
            ]}
            fullWidth
            size="md"
          />
        </div>
      </div>

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
          onAdd={onAdd}
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
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
  statusOptions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  onAdd: PropTypes.func,
};
