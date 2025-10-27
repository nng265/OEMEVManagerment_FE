import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import Pagination from "../../../components/molecules/Pagination/Pagination";

/**
 * View cho Manufacturer Inventory (EVM staff)
 * Hiển thị danh sách part + phân trang theo server
 */
export const ManufacturerInventory = ({
  data = [],
  loading = false,
  error = null,
  pageNumber = 0,
  pageSize = 20,
  totalPages = 1,
  totalRecords = 0,
  onPageChange, // callback từ container để gọi lại API
  onPageSizeChange,
}) => {
  const columns = [
    { key: "model", label: "Model" },
    { key: "category", label: "Category" },
    { key: "stockQuantity", label: "Quantity" },
    { key: "status", label: "Status" },
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
  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (typeof onPageSizeChange === "function") onPageSizeChange(newSize);
  };

  return (
    <div style={{ padding: 8 }}>
      <h2 style={{ marginBottom: 4 }}>Manufacturer Inventory</h2>
      <p style={{ marginBottom: 12, color: "#555" }}>
        View parts available at the Manufacturer's inventory.
      </p>

      <DataTable
        data={rows}
        columns={columns}
        isLoading={loading}
        searchable
        pageSize={pageSize}
        pagination={false}
        exportable={false}
        noDataMessage={error || "No records found"}
        selectable={false}
      />

      {/* ✅ Pagination thực sự gọi API */}
      <div className="inventory-pagination" style={{ marginTop: 12 }}>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

ManufacturerInventory.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  pageNumber: PropTypes.number,
  totalPages: PropTypes.number,
  totalRecords: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
};

export default ManufacturerInventory;
