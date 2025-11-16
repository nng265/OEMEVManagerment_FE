import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "./CampaignList.css";

const CampaignList = ({
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
  // Type options for filter
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Service", label: "Service" },
    { value: "Recall", label: "Recall" },
  ];

  // Status options for filter
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Close", label: "Close" },
  ];
  const columns = [
    { key: "title", label: "Campaign" },
    { key: "type", label: "Type" },
    { key: "description", label: "Target" },
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
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center", // Căn giữa ngang
            alignItems: "center", // Căn giữa dọc
          }}
        >
          <Button size="small" variant="light" onClick={() => onView?.(row)}>
            <img
              src="../../../../../public/eye.png"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>
          {(row.status === "ACTIVE" || row.status === "Active") && (
            <Button size="small" variant="primary" onClick={() => onAdd?.(row)}>
              Add
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows = data.map((c, i) => ({
    id: c.campaignId,
    title: c.title,
    type: c.type,
    description: c.description,
    period: `${c.startDate ?? ""} to ${c.endDate ?? ""}`,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    partModel: c.partModel,
    replacementPartModel: c.replacementPartModel,
    completedVehicles: c.completedVehicles,
    inProgressVehicles: c.inProgressVehicles,
    pendingVehicles: c.pendingVehicles,
  }));

  return (
    <div className="campaign-table">
      <h2 className="size-h1">Campaign Management</h2>

      {/* Search Bar and Filters */}
      <div className="campaign-filters" style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <Input
            type="text"
            placeholder="Search by Campaign Title..."
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
  );
};

CampaignList.propTypes = {
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
  onSearch: PropTypes.func,
  onFilterType: PropTypes.func,
  onFilterStatus: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  typeFilter: PropTypes.string,
  onTypeFilterChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
};

export default CampaignList;
