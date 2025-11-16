import React from "react";
import PropTypes from "prop-types";
import "./PolicyList.css";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";

const PolicyList = ({
  data = [],
  loading = false,
  error = null,
  pagination = {},
  serverSide = true,
  onPageChange,
  onSearch,
  onFilterStatus,
  onRefresh,
  refreshing = false,
  onCreatePolicy,
  onViewPolicy,
  onEditPolicy,
  onDeletePolicy,
}) => {
  const columns = [
    { key: "policyName", label: "Policy Name" },
    { key: "conditions", label: "Conditions" },
    { key: "coveragePeriodMonths", label: "Coverage Period (Months)" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const normalized = (value || "unknown").trim().toLowerCase();
        const badgeClass = `status-badge status-${normalized}`;
        const display = value
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : "Unknown";
        return <span className={badgeClass}>{display}</span>;
      },
    },

    {
      key: "action",
      label: "Action",
      render: (_v, row) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button
            size="small"
            variant="light"
            onClick={() => onViewPolicy?.(row)}
          >
            <img
              src="../../../../../public/eye.png"
              alt="view"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>

          {/* EDIT */}
          <Button
            size="small"
            variant="light"
            onClick={() => onEditPolicy(row.raw)}
          >
            Edit
          </Button>

          {/* DELETE moved into Edit modal for better UX */}
        </div>
      ),
    },
  ];

  const rows = data.map((p, i) => ({
    policyId: p.policyId ?? "-",
    policyName: p.policyName ?? "-",
    conditions: p.conditions ?? "-",
    coveragePeriodMonths: p.coveragePeriodMonths ?? "-",
    status: p.status ?? (p.active ? "Active" : "Inactive"),
    // Preserve original/raw payload for actions (edit/delete/view)
    raw: p.__raw ?? p._raw ?? p,
  }));
  return (
    <div className="policy-table">
      <div
        className="policy-table__header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <h2 className="size-h1">Policy Management</h2>
        <Button
          size="small"
          variant="primary"
          onClick={() => onCreatePolicy?.()}
          style={{ marginLeft: "auto" }}
        >
          Create Policy
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
        noDataMessage={error ? String(error) : "No policies found"}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onSearch={onSearch}
        onFilterStatus={onFilterStatus}
        onViewPolicy={onViewPolicy}
        onEditPolicy={onEditPolicy}
        onDeletePolicy={onDeletePolicy}
      />
    </div>
  );
};

PolicyList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pagination: PropTypes.shape({
    totalRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
  }),
  serverSide: PropTypes.bool,
  onPageChange: PropTypes.func,
  onSearch: PropTypes.func,
  onFilterStatus: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  onCreatePolicy: PropTypes.func,
  onViewPolicy: PropTypes.func,
  onEditPolicy: PropTypes.func,
  onDeletePolicy: PropTypes.func,
};

export default PolicyList;
