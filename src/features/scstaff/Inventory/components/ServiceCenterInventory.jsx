// export default ServiceCenterInventory;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
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
    { key: "status", label: "Status" },
    { key: "stockQuantity", label: "Quantity", sortType: "number" },
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

  return (
    <div className="sc-container" style={{ marginTop: 0 }}>
      <div className="sc-inventory">
        <h1 className="sc-inventory__title">Service Center Inventory</h1>
        <p className="sc-inventory__subtitle">
          Manage and request parts from the Service Center inventory.
        </p>

        <div className="sc-inventory__filters">
          <input
            type="text"
            placeholder="Search by model..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sc-inventory__search"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="sc-inventory__select"
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
            className="sc-inventory__clear"
          >
            Clear
          </Button>
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
};

export default ServiceCenterInventory;
