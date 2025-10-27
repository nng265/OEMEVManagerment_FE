// export default ServiceCenterInventory;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/atoms/Button/Button";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";

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
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  // Gọi search/filter mỗi khi thay đổi input
  useEffect(() => {
    onSearch(query);
  }, [query]);

  useEffect(() => {
    onFilter(category);
  }, [category]);

  // Cấu hình cột cho bảng
  const columns = [
    { key: "model", label: "Model" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "stockQuantity", label: "Quantity" },
    {
      key: "action",
      label: "Action",
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

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Service Center Inventory</h2>
      <p style={{ marginBottom: 12, color: "#555" }}>
        Manage and request parts from the Service Center inventory.
      </p>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by model..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          disabled={!query && !category}
          onClick={() => {
            setQuery("");
            setCategory("");
          }}
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
        pageSize={pageSize}
        totalRecords={totalRecords}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        exportable={false}
        noDataMessage={error || "No items found"}
      />
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
};

export default ServiceCenterInventory;
