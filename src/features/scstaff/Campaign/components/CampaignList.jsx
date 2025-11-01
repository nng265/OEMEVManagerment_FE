import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
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
  onSearch,
  onFilterType,
  onFilterStatus,
}) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    onSearch?.(query);
  }, [query]);

  useEffect(() => {
    onFilterType?.(typeFilter);
  }, [typeFilter]);

  useEffect(() => {
    onFilterStatus?.(statusFilter);
  }, [statusFilter]);

  const typeOptions = Array.from(new Set(data.map((c) => c.type).filter(Boolean)));
  const statusOptions = Array.from(new Set(data.map((c) => c.status).filter(Boolean)));

  const columns = [
    { key: "title", label: "Campaign" },
    { key: "type", label: "Type" },
    { key: "partModel", label: "Target" },
    { key: "period", label: "Period" },
    { key: "status", label: "Status" },
    {
      key: "action",
      label: "Actions",
      render: (_v, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button size="small" variant="primary" onClick={() => onView?.(row)}>
            View
          </Button>
          {(row.status === "ACTIVE" || row.status === "Active") && (
            <Button size="small" variant="success" onClick={() => onAdd?.(row)}>
              + Add Campaign
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows = data.map((c, i) => ({
    id: c.id ?? i,
    title: c.title || "—",
    type: c.type || "—",
    partModel: c.partModel || "_",
    period: c.period ?? `${c.startDate ?? ""} to ${c.endDate ?? ""}`,
    status: c.status || "—",
  }));

  return (
    <div className="campaign-table">
      <div className="campaign-table__header">
        <h1>Campaign Management</h1>
        {/* Nút Add Campaign đã bị loại bỏ khỏi header */}
      </div>

      <div className="campaign-filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {typeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
};

export default CampaignList;
