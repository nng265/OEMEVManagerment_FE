import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";

export default function AccessoryList({
  data = [],
  loading = false,
  error = null,
  onView,
  pagination,
  onPageChange,
  onRefresh,
  refreshing = false,

  search = "",
  onSearchChange,

  statusFilter = "",
  onStatusFilterChange,

  // conditionFilter = "",
  // onConditionFilterChange,
}) {
  const items = Array.isArray(data)
    ? data
    : data?.items || data?.data?.items || [];

  const columns = [
    { key: "vin", label: "VIN" },
    { key: "serial", label: "Serial" },
    { key: "model", label: "Part Model" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className={`status-badge status-${value?.toLowerCase()}`}>
          {value}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button variant="light" size="sm" onClick={() => onView(row.raw)}>
          <img src="/eye.png" className="eye-svg" style={{ width: 22 }} />
        </Button>
      ),
    },
  ];

  const rows = items.map((d) => ({
    serial: d.serialNumber,
    model: d.model,
    vin: d.vin,
    condition: d.condition,
    status: d.status,
    raw: d,
  }));

  return (
    <div style={{ padding: 8 }}>
      <h1 style={{ marginBottom: 30 }}>Accessory </h1>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Input
          type="text"
          placeholder="Search vin or serial or part model....."
          value={search}
          onChange={onSearchChange}
          fullWidth
        />

        <Input
          type="select"
          value={statusFilter}
          onChange={onStatusFilterChange}
          fullWidth
          options={[
            { value: "", label: "All Status" },
            { value: "InStock", label: "In Stock" },
            { value: "OnVehicle", label: "On Vehicle" },
            { value: "Returned", label: "Returned" },
          ]}
        />
        {/* <Input
          type="select"
          value={conditionFilter}
          onChange={onConditionFilterChange}
          fullWidth
          options={[
            { value: "", label: "All Conditions" },
            { value: "New", label: "New" },
            { value: "Refurbished", label: "Refurbished" },
            { value: "Used", label: "Used" },
          ]}
        /> */}
      </div>

      {/* TABLE */}
      <div style={{ position: "relative" }}>
        {loading && (
          <div className="data-table-loading">
            <LoadingSpinner size="lg" />
          </div>
        )}

        <DataTable
          data={rows}
          columns={columns}
          pagination
          serverSide
          totalRecords={pagination.totalRecords}
          currentPage={pagination.pageNumber}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          noDataMessage={error || "No record found"}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
}
