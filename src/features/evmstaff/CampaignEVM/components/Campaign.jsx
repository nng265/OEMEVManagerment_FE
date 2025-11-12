import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "./Campaign.css";

export const Campaign = ({
  data = [],
  loading = false,
  error = null,
  pagination = {},
  serverSide = true,
  onView,
  onAdd,
  onPageChange,
  onRefresh,
  refreshing = false,
  searchQuery = "",
  onSearchChange,
  typeFilter = "",
  onTypeFilterChange,
  statusFilter = "",
  onStatusFilterChange,
}) => {
  // Type and Status options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Service", label: "Service" },
    { value: "Recall", label: "Recall" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Close", label: "Close" },
  ];

  const columns = [
    { key: "title", label: "Campaign" },
    { key: "target", label: "Target" },
    { key: "type", label: "Type" },
    { key: "period", label: "Period" },
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
      key: "action",
      label: "Actions",
      render: (_v, row) => (
        <Button size="small" variant="light" onClick={() => onView?.(row)}>
          <img
            src="../../../../../public/eye.png"
            className="eye-svg"
            style={{ width: "22px" }}
          />
        </Button>
      ),
    },
  ];

  const rows = data.map((c, i) => ({
    // Preserve identifiers to support actions that need IDs
    id: c?._raw?.campaignId || c?._raw?.id || c?.campaignId || c?.id || i,
    _raw: c?._raw || c,

    // Display fields
    description: c.description || "",
    target: c.target || "—",
    title: c.title || "—",
    type: c.type || "—",
    startDate: c.startDate,
    endDate: c.endDate,
    period: c.period ?? `${c.startDate ?? ""} to ${c.endDate ?? ""}`,
    status: c.status || "—",

    totalAffectedVehicles: c.totalAffectedVehicles || 0,
    pendingVehicles: c.pendingVehicles || 0,
    inProgressVehicles: c.inProgressVehicles || 0,
    completedVehicles: c.completedVehicles || 0,
  }));

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1>Campaign Management</h1>
        <Button variant="success" onClick={onAdd}>
          + Add Campaign
        </Button>
      </div>

      {/* Search Bar and Filters */}
      <div className="campaign-filters" style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <Input
            type="text"
            placeholder="Search by Title..."
            value={searchQuery}
            onChange={onSearchChange}
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
        <div style={{ flex: 1 }}>
          <Input
            type="select"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={statusOptions}
            fullWidth
            size="md"
          />
        </div>
      </div>

      <div className="campaign-table__content">
        <DataTable
          data={rows}
          columns={columns}
          isLoading={loading}
          searchable={false}
          pagination
          serverSide={serverSide}
          totalRecords={pagination.totalRecords ?? rows.length}
          currentPage={pagination.pageNumber ?? 0}
          pageSize={pagination.pageSize ?? 10}
          onPageChange={onPageChange}
          noDataMessage={error ? String(error) : "No campaigns found"}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
};

Campaign.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pagination: PropTypes.shape({
    totalRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
  }),
  onView: PropTypes.func,
  onAdd: PropTypes.func.isRequired,
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  typeFilter: PropTypes.string,
  onTypeFilterChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
};

export default Campaign;
