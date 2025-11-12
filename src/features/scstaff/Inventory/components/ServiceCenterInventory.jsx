// export default ServiceCenterInventory;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "./ServiceCenterInventory.css";

/**
 * View hiển thị Inventory của Service Center
 * Props:
 * - data: danh sách items
 * - categories: danh sách category để lọc
 * - loading: boolean (trạng thái tải)
 * - onSearch, onFilter, onRequest: callback từ container
 */
export const ServiceCenterInventory = ({
  data = [],
  categories = [],
  loading = false,
  error = null,
  onSearch,
  onFilter,
  onRequest,
  // pagination props
  pagination,
  onPageChange,
  serverSide = true,
  onRefresh,
  refreshing = false,
  // New props for search and status filter
  searchQuery = "",
  onSearchChange,
  statusFilter = "",
  onStatusFilterChange,
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  // Gọi search/filter mỗi khi thay đổi input
  useEffect(() => {
    if (typeof onSearch === "function") {
      onSearch(query);
    }
  }, [query, onSearch]);

  useEffect(() => {
    if (typeof onFilter === "function") {
      onFilter(category);
    }
  }, [category, onFilter]);

  // Cấu hình cột cho bảng
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

    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (_v, row) => (
        <Button size="small" variant="primary" onClick={() => onRequest(row)}>
          Request Part
        </Button>
      ),
    },
  ];

  // Dữ liệu hiển thị
  const rows = (data || []).map((item, index) => ({
    id: item.id ?? item._raw?.id ?? `${item.model ?? "part"}-${index}`,
    model: item.model,
    category: item.category,
    status: item.status,
    stockQuantity: item.stockQuantity,
  }));

  const totalRecords = pagination?.totalRecords ?? data.length;
  const currentPage = pagination?.pageNumber ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

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
    <div className="sc-container" style={{ marginTop: 0 }}>
      <div className="sc-inventory">
        <h1 className="size-h1">Service Center Inventory</h1>

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

        <div className="sc-inventory__table-wrapper">
          <DataTable
            data={rows}
            columns={columns}
            isLoading={loading}
            searchable={false}
            pagination
            serverSide={serverSide}
            pageSize={pageSize}
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            exportable={false}
            noDataMessage={error || "No items found"}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </div>
      </div>
    </div>
  );
};

ServiceCenterInventory.propTypes = {
  data: PropTypes.array,
  categories: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSearch: PropTypes.func,
  onFilter: PropTypes.func,
  onRequest: PropTypes.func,
  pagination: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    totalRecords: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  serverSide: PropTypes.bool,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func,
};

export default ServiceCenterInventory;
