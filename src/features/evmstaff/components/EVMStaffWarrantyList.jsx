// src/features/evmStaff/components/EVMStaffWarrantyList.jsx
import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../components/atoms/Button/Button";
import { formatDate } from "../../../utils/helpers";

export const EVMStaffWarrantyList = ({
  data = [],
  loading = false,
  error = null,
  onView,
  pagination,
  onPageChange,
}) => {
  const columns = [
    { key: "vin", label: "VIN" },
    {
      key: "createdDate",
      label: "Created Date",
      render: (val) =>
        val
          ? formatDate(val, "en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          : "-",
    },
    { key: "status", label: "Status" },
    {
      key: "description",
      label: "Description",
      render: (val) =>
        val && val.length > 120 ? `${val.slice(0, 120)}...` : val,
    },
    {
      key: "actions",
      label: "Actions",
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

  // Map data thành rows (ở đây xử lý đơn giản)
  const rows =
    data.map((c) => ({
      id: c.id,
      vin: c.vin || c.vehicle?.vin || "-",
      createdDate: c.approvedDate || c.assignedDate || c.createdAt || "",
      status: (c.status || "").replace(/_/g, " "),
      description: c.description || c.title || "-",
      raw: c,
    })) ?? [];

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ marginBottom: 12 }}>Vehicle / Warranty claims</h2>

      <DataTable
        data={rows}
        columns={columns}
        isLoading={loading}
        searchable
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

