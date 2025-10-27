// src/features/evmStaff/components/EVMStaffWarrantyList.jsx
import React from "react";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../components/atoms/Button/Button";
import { formatDate } from "../../../utils/helpers";
import { Pagination } from "../../../components/molecules/Pagination/Pagination";

export const EVMStaffWarrantyList = ({
  data = [],
  loading = false,
  error = null,
  onView,

  pageNumber = 0,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
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
      vin: c.vin || "",
      createdDate: c.createdDate || " ",
      status: (c.status || "").replace(/_/g, " "),
      description: c.description || " ",
      raw: c,
    })) ?? [];

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ marginBottom: 12 }}>Vehicle / Warranty claims</h2>

      <DataTable
        data={rows}
        columns={columns}
        isLoading={loading}
        pagination={false}
        searchable
        exportable={false}
        noDataMessage={error || "No claims found"}
        selectable={false}
      />

      {/* === Pagination Section === */}
      <div style={{ marginTop: 16 }}>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages} // TODO
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};

export default EVMStaffWarrantyList;
