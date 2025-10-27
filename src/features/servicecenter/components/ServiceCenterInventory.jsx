// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Button } from "../../../components/atoms/Button/Button";
// import { DataTable } from "../../../components/organisms/DataTable/DataTable";

// /**
//  * Component hiển thị bảng Inventory cho Service Center
//  * Props:
//  * - data: mảng item đã được chuẩn hoá { model, category, status, stockQuantity }
//  * - categories: danh sách category để filter
//  * - onSearch: callback khi thay đổi query
//  * - onFilter: callback khi chọn category
//  * - onRequest: callback khi bấm Request
//  */
// export const ServiceCenterInventory = ({
//   data,
//   categories,
//   onSearch,
//   onFilter,
//   onRequest,
// }) => {
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("");

//   // Khi query thay đổi, gọi handler truyền từ container
//   useEffect(() => {
//     onSearch(query);
//   }, [query, onSearch]);

//   // Khi category thay đổi, gọi handler truyền từ container
//   useEffect(() => {
//     onFilter(category);
//   }, [category, onFilter]);

//   // Cấu hình các cột cho DataTable (sử dụng key trùng với field trong data)
//   const columns = [
//     { key: "model", label: "Model" },
//     { key: "category", label: "Category" },
//     { key: "status", label: "Status" },
//     { key: "stockQuantity", label: "Quantity" },
//     {
//       key: "action",
//       label: "Action",
//       render: (_value, row) => (
//         <Button size="small" variant="primary" onClick={() => onRequest(row)}>
//           Request Part
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 16 }}>
//       <h2>Service Center Inventory</h2>

//       <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
//         <input
//           type="text"
//           placeholder="Search by model..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           style={{ flex: 1, padding: 8 }}
//         />
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           style={{ padding: 8 }}
//         >
//           <option value="">All Categories</option>
//           {categories.map((c, i) => (
//             <option key={i} value={c}>
//               {c}
//             </option>
//           ))}
//         </select>
//         <Button
//           variant="secondary"
//           onClick={() => {
//             setQuery("");
//             setCategory("");
//           }}
//         >
//           Clear
//         </Button>
//       </div>

//       <DataTable columns={columns} data={data} />
//     </div>
//   );
// };

// ServiceCenterInventory.propTypes = {
//   data: PropTypes.array,
//   categories: PropTypes.array,
//   onSearch: PropTypes.func,
//   onFilter: PropTypes.func,
//   onRequest: PropTypes.func,
// };

// ServiceCenterInventory.defaultProps = {
//   data: [],
//   categories: [],
//   onSearch: () => {},
//   onFilter: () => {},
//   onRequest: () => {},
// };

// export default ServiceCenterInventory;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/atoms/Button/Button";
import { DataTable } from "../../../components/organisms/DataTable/DataTable";
import Pagination from "../../../components/molecules/Pagination/Pagination";

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
  onSearch,
  onFilter,
  onRequest,
  // pagination props
  pageNumber = 0,
  pageSize = 10,
  totalPages = 1,
  totalRecords = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
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
  const rows = (data || []).map((item) => ({
    model: item.model,
    category: item.category,
    status: item.status,
    stockQuantity: item.stockQuantity,
  }));

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
        pagination={false}
        pageSize={pageSize}
        exportable={false}
        noDataMessage="No items found"
      />

      {/* External pagination control (harmonized with Manufacturer view) */}
      <div style={{ marginTop: 12 }}>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};

ServiceCenterInventory.propTypes = {
  data: PropTypes.array,
  categories: PropTypes.array,
  loading: PropTypes.bool,
  onSearch: PropTypes.func,
  onFilter: PropTypes.func,
  onRequest: PropTypes.func,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  totalPages: PropTypes.number,
  totalRecords: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
};

export default ServiceCenterInventory;
