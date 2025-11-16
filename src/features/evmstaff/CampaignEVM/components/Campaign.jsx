import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "./Campaign.css";

/*
  Component: Campaign
  Mô tả (VN):
  - Component presentational để hiển thị danh sách campaign dưới dạng bảng.
  - Nhận `data` (mảng đã được normalize bởi container), `pagination`, và các
    callback như `onView`, `onAdd`, `onPageChange`, `onSearch`, `onFilterType`,
    `onFilterStatus`, `onRefresh`.

  Những điểm cần biết khi đọc mã:
  - `typeOptions` và `statusOptions` được derive từ `data` hiện tại để render
    dropdown filter (nếu bật UI filter).
  - `columns` định nghĩa cột cho `DataTable`, trong đó `render` là function cho
    custom cell rendering (ví dụ: badge cho status, nút action).
  - `rows` map `data` sang cấu trúc hàng (row) mà `DataTable` mong đợi, kèm `_raw`
    để giữ payload gốc nếu cần hành động dựa trên ID gốc.
*/

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
        // Chuẩn hoá giá trị status để tạo CSS class và hiển thị text đẹp hơn
        const normalizedStatus = (value || "unknown").trim().toLowerCase();
        const statusClass = normalizedStatus.replace(/\s+/g, "-");
        const displayText =
          value && value.length > 0
            ? value.charAt(0).toUpperCase() + value.slice(1)
            : "Unknown";

        // Trả về badge với class động, ví dụ: status-open, status-closed
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

  // Lưu ý: `rows` là dữ liệu cuối cùng truyền vào `DataTable`. Việc giữ `_raw`
  // giúp dễ lấy ID gốc hoặc gửi payload gốc khi thao tác (ví dụ: xem hoặc edit).

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

/*
  Giải thích nhanh về `propTypes` (VN):
  - `propTypes` dùng để mô tả kiểu dữ liệu props ở runtime (chỉ trong môi trường dev
    sẽ xuất cảnh báo nếu prop sai kiểu hoặc thiếu prop required).
  - Ví dụ: `data` là mảng object; `onAdd` bắt buộc phải có vì component cần nút Add.
  - Không thay thế TypeScript — nhưng giúp catch lỗi sớm khi dùng JS thuần.
*/
