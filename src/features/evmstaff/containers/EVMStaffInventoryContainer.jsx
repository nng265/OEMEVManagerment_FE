// // src/features/evm/containers/EVMStaffInventoryContainer.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { request, ApiEnum } from "../../../services/NetworkUntil";
// import ManufacturerInventory from "../components/ManufacturerInventory";

// /**
//  * Container cho màn hình Manufacturer Inventory (EVM Staff)
//  * - Tải danh sách parts từ API
//  * - Hỗ trợ tìm kiếm theo model hoặc category
//  * - Pagination server-side (fetch từng trang)
//  */
// export const EVMStaffInventoryContainer = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Pagination states
//   const [pageNumber, setPageNumber] = useState(0);
//   const [pageSize, setPageSize] = useState(20);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalRecords, setTotalRecords] = useState(0);

//   // Search state
//   const [searchQuery, setSearchQuery] = useState("");

//   // Fetch inventory (server-side pagination)
//   const fetchInventory = useCallback(
//     async (page = pageNumber, query = searchQuery) => {
//       setLoading(true);
//       try {
//         const res = await request(
//           `${ApiEnum.GET_PART}?pageNumber=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
//             query || ""
//           )}`
//         );

//         console.log("EVM Inventory API result:", res);
//         const result = res?.data ?? {};

//         const normalized = (result.items || []).map((it) => ({
//           model: it.model,
//           name: it.name,
//           category: it.category,
//           stockQuantity: it.stockQuantity,
//           status: it.status,
//         }));

//         setItems(normalized);
//         setPageNumber(result.pageNumber ?? page);
//         setTotalPages(result.totalPages ?? 1);
//         setTotalRecords(result.totalRecords ?? normalized.length);
//       } catch (err) {
//         console.error("Lỗi khi load inventory:", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [pageNumber, pageSize, searchQuery]
//   );

//   // Initial load
//   useEffect(() => {
//     fetchInventory(0);
//   }, [fetchInventory]);

//   // Search handler (optional local filter or backend search)
//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     setPageNumber(0);
//     fetchInventory(0, query);
//   };

//   // Pagination handler
//   const handlePageChange = (newPage) => {
//     setPageNumber(newPage);
//     fetchInventory(newPage);
//   };

//   return (
//     <div style={{ marginTop: 40 }}>
//       <ManufacturerInventory
//         data={items}
//         loading={loading}
//         onSearch={handleSearch}
//         pageNumber={pageNumber}
//         pageSize={pageSize}
//         totalPages={totalPages}
//         totalRecords={totalRecords}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// };

// export default EVMStaffInventoryContainer;

// src/features/evm/containers/EVMStaffInventoryContainer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import ManufacturerInventory from "../components/ManufacturerInventory";

/**
 * Container cho màn hình Manufacturer Inventory (EVM Staff)
 * - Hỗ trợ phân trang phía server
 * - Khi đổi trang thì gọi lại API
 */
export const EVMStaffInventoryContainer = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // =====================
  // FETCH INVENTORY
  // =====================
  const fetchInventory = useCallback(
    async (page = pageNumber) => {
      setLoading(true);
      try {
        // Gọi API có query pagination (use consistent param names)
        const res = await request(ApiEnum.GET_PART, {
          params: { pageNumber: page, pageSize },
        });

        const result = res?.data?.data || res?.data || {};
        const rawItems = result.items || [];

        const normalized = rawItems.map((it) => ({
          model: it.model,
          name: it.name,
          category: it.category,
          stockQuantity: it.stockQuantity,
          status: it.status,
        }));

        setItems(normalized);
        setFilteredItems(normalized);
        setPageNumber(result.pageNumber ?? page);
        setPageSize(result.pageSize ?? pageSize);
        setTotalPages(result.totalPages ?? 1);
        setTotalRecords(result.totalRecords ?? normalized.length);
      } catch (err) {
        console.error("❌ Lỗi khi load inventory:", err);
      } finally {
        setLoading(false);
      }
    },
    [pageNumber, pageSize]
  );

  // Lần đầu load
  useEffect(() => {
    fetchInventory(pageNumber);
  }, [fetchInventory]);

  // =====================
  // SEARCH HANDLER
  // =====================
  const handleSearch = (query) => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return setFilteredItems(items);

    setFilteredItems(
      items.filter(
        (item) =>
          (item.model || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q)
      )
    );
  };

  // =====================
  // PAGINATION HANDLER
  // =====================
  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
    fetchInventory(newPage);
  };

  // =====================
  // RENDER
  // =====================
  return (
    <div style={{ marginTop: 40 }}>
      <ManufacturerInventory
        data={filteredItems}
        loading={loading}
        onSearch={handleSearch}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPageNumber(0);
          fetchInventory(0);
        }}
      />
    </div>
  );
};

export default EVMStaffInventoryContainer;
