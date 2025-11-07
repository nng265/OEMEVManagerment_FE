import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
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
  onSearch,
  onFilterType,
  onFilterStatus,
  onRefresh,
  refreshing = false,
}) => {
  // Local filter states mimic ServiceCenterInventory behavior
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (typeof onSearch === "function") onSearch(query);
  }, [query, onSearch]);

  useEffect(() => {
    if (typeof onFilterType === "function") onFilterType(typeFilter);
  }, [typeFilter, onFilterType]);

  useEffect(() => {
    if (typeof onFilterStatus === "function") onFilterStatus(statusFilter);
  }, [statusFilter, onFilterStatus]);
  // Derive filter options from data to keep it in sync with what's shown
  const typeOptions = Array.from(
    new Set((data || []).map((c) => c.type).filter(Boolean))
  );
  const statusOptions = Array.from(
    new Set((data || []).map((c) => c.status).filter(Boolean))
  );

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

      {/* Filters (search + type + status) */}
      {/* <div
        className="campaign-filters"
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <input
          type="text"
          placeholder="Search by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {typeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => {
            setQuery("");
            setTypeFilter("");
            setStatusFilter("");
          }}
          disabled={!query && !typeFilter && !statusFilter}
        >
          Clear
        </Button>
      </div> */}

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
  onSearch: PropTypes.func,
  onFilterType: PropTypes.func,
  onFilterStatus: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
};

export default Campaign;
