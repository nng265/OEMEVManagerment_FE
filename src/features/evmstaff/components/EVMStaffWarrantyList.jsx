import React from "react";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../components/atoms/Button/Button";
import { formatDate } from "../../../utils/helpers";

export const EVMStaffWarrantyList = ({
  data = null, // response từ backend
  loading = false,
  error = null,
  onView,
}) => {
  // ✅ Lấy danh sách items từ response
  const items = data?.data?.items ?? [];

  // ✅ Cấu hình cột hiển thị trong bảng
  const columns = [
    { key: "vin", label: "VIN" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    { key: "customerName", label: "Customer Name" },
    { key: "customerPhoneNumber", label: "Phone" },
    {
      key: "createdDate",
      label: "Created Date",
      render: (val) =>
        val
          ? formatDate(val, "en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
    },
    {
      key: "failureDesc",
      label: "Failure Description",
      render: (val) =>
        val && val.length > 80 ? `${val.slice(0, 80)}...` : val || "-",
    },
    {
      key: "description",
      label: "Claim Description",
      render: (val) =>
        val && val.length > 80 ? `${val.slice(0, 80)}...` : val || "-",
    },
    {
      key: "policy",
      label: "Warranty Policy",
      render: (_, row) =>
        row.showPolicy?.length
          ? row.showPolicy.map((p) => p.policyName).join(", ")
          : "-",
    },
    {
      key: "parts",
      label: "Claim Parts",
      render: (_, row) =>
        row.showClaimParts?.length
          ? row.showClaimParts
              .map((part) => `${part.model} (${part.status})`)
              .join(", ")
          : "-",
    },
    {
      key: "attachments",
      label: "Attachments",
      render: (_, row) =>
        row.attachments?.length ? `${row.attachments.length} file(s)` : "-",
    },
    { key: "status", label: "Status" },
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

  // ✅ Chuyển items thành rows cho DataTable
  const rows = items.map((item, index) => ({
    id: item.claimId || index,
    vin: item.vin || "-",
    model: item.model || "-",
    year: item.year || "-",
    customerName: item.customerName || "-",
    customerPhoneNumber: item.customerPhoneNumber || "-",
    createdDate: item.createdDate || "",
    failureDesc: item.failureDesc || "-",
    description: item.description || "-",
    status: item.status || "-",
    showPolicy: item.showPolicy || [],
    showClaimParts: item.showClaimParts || [],
    attachments: item.attachments || [],
    raw: item,
  }));

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ marginBottom: 12 }}>Sent To Manufacturer Claims</h2>

      <DataTable
        data={rows}
        columns={columns}
        isLoading={loading}
        searchable
        pagination
        pageSize={data?.data?.pageSize || 10}
        exportable={false}
        noDataMessage={error || "No claims found"}
        selectable={false}
      />

      {/* ✅ Hiển thị thông tin phân trang (backend) */}
      {data?.data && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
          Page {data.data.pageNumber + 1} / {data.data.totalPages} • Total:{" "}
          {data.data.totalRecords} records
        </div>
      )}
    </div>
  );
};

export default EVMStaffWarrantyList;
