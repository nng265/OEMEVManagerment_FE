import React from "react";
import PropTypes from "prop-types";
import { Input } from "../../../../components/atoms/Input/Input";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";

/**
 * View cho Manufacturer Inventory (EVM staff)
 * Hiển thị danh sách part + phân trang theo server
 */
export const ManufacturerInventory = ({
  data = [],
  loading = false,
  error = null,
  pagination,
  onPageChange, // callback từ container để gọi lại API
  onRefresh,
  refreshing = false,
  searchQuery = "",
  onSearchChange,
  statusFilter = "",
  onStatusFilterChange,
}) => {
  const totalRecords = pagination?.totalRecords ?? data.length;
  const currentPage = pagination?.pageNumber ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

  const columns = [
    { key: "model", label: "Model" },
    { key: "category", label: "Category" },
    { key: "stockQuantity", label: "Quantity", sortType: "number" },
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
  ];

  // Chuẩn hóa dữ liệu cho DataTable
  const rows = (data || []).map((item, index) => ({
    id: item.id || index,
    model: item.model || "-",
    category: item.category || "-",
    stockQuantity: item.stockQuantity ?? 0,
    status: item.status || "-",
  }));

  // Hàm xử lý đổi trang (truyền ra ngoài container)
  const handlePageChange = (pageIndex, newPageSize) => {
    if (typeof onPageChange === "function") {
      onPageChange(pageIndex, newPageSize);
    }
  };

  // Status options for filter
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "In Stock", label: "In Stock" },
    { value: "Low Stock", label: "Low Stock" },
    { value: "Out of Stock", label: "Out of Stock" },
  ];

  return (
    <div style={{ padding: 10 }}>
      <h1 style={{ marginBottom: 16 }}>Manufacturer Inventory</h1>

      {/* Search Bar and Status Filter */}
      <div className="inventory-filters" style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <Input
            type="text"
            placeholder="Search by Model or Category..."
            value={searchQuery}
            onChange={onSearchChange}
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

      <div style={{ position: "relative" }}>
        {loading && (
          <div className="data-table-loading">
            <LoadingSpinner size="lg" />
            <p className="data-table-loading-message">
              Loading manufacturer inventory...
            </p>
          </div>
        )}
        <DataTable
          data={rows}
          columns={columns}
          searchable={false}
          pagination
          serverSide
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          exportable={false}
          noDataMessage={error || "No records found"}
          selectable={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
};

ManufacturerInventory.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
};

export default ManufacturerInventory;
