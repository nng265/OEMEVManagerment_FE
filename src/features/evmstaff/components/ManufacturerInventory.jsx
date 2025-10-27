import React from "react";
import PropTypes from "prop-types";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";

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
}) => {
  const totalRecords = pagination?.totalRecords ?? data.length;
  const currentPage = pagination?.pageNumber ?? 0;
  const pageSize = pagination?.pageSize ?? 20;

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
  const handlePageChange = (pageIndex, newPageSize) => {
    if (typeof onPageChange === "function") {
      onPageChange(pageIndex, newPageSize);
    }
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
      />
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
};

export default ManufacturerInventory;
