// export default EVMStaffInventoryContainer;

// src/features/evm/containers/EVMStaffInventoryContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../services/helpers";
import ManufacturerInventory from "../components/ManufacturerInventory";

/**
 * Container cho màn hình Manufacturer Inventory (EVM Staff)
 * - Hỗ trợ phân trang phía server
 * - Khi đổi trang thì gọi lại API
 */
export const EVMStaffInventoryContainer = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalRecords: 0,
  });
  const paginationRef = useRef(pagination);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // =====================
  // FETCH INVENTORY
  // =====================
  const fetchInventory = useCallback(
    async (pageNumber = 0, size) => {
      const effectiveSize =
        typeof size === "number" && size > 0
          ? size
          : paginationRef.current.pageSize;
      const effectivePage =
        typeof pageNumber === "number" && pageNumber >= 0
          ? pageNumber
          : paginationRef.current.pageNumber;

      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      setLoading(true);
      setError(null);

      try {
        const response = await request(ApiEnum.GET_PART, {
          Page: effectivePage,
          Size: effectiveSize,
        });

        const {
          success,
          items: rawItems,
          totalRecords,
          page,
          size: pageSize,
          message,
        } = normalizePagedResult(response, []);

        if (requestId !== latestRequestRef.current) {
          return;
        }

        if (success) {
          const normalized = rawItems.map((it, index) => ({
            id: it.id ?? it.partId ?? `${it.model ?? "part"}-${index}`,
            model: it.model ?? it.name ?? "-",
            category: it.category ?? it.categoryName ?? "-",
            stockQuantity: it.stockQuantity ?? it.stockQty ?? 0,
            status: it.status ?? it.inventoryStatus ?? "-",
          }));

          setItems(normalized);
          setPagination({
            pageNumber:
              typeof page === "number" && page >= 0 ? page : effectivePage,
            pageSize:
              typeof pageSize === "number" && pageSize > 0
                ? pageSize
                : effectiveSize,
            totalRecords:
              typeof totalRecords === "number"
                ? totalRecords
                : normalized.length,
          });
        } else {
          setItems([]);
          setPagination((prev) => ({
            ...prev,
            pageNumber: effectivePage,
            pageSize: effectiveSize,
            totalRecords: 0,
          }));
          setError(message || "Unable to load inventory.");
        }
      } catch (err) {
        console.error("❌ Lỗi khi load inventory:", err);
        if (requestId === latestRequestRef.current) {
          const message =
            err?.responseData?.message ||
            err?.message ||
            "Unable to load inventory.";
          setItems([]);
          setPagination((prev) => ({
            ...prev,
            pageNumber: effectivePage,
            pageSize: effectiveSize,
            totalRecords: 0,
          }));
          setError(message);
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Lần đầu load
  useEffect(() => {
    fetchInventory(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize
    );
  }, [fetchInventory]);

  // =====================
  // SEARCH HANDLER
  // =====================
  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      const nextPage = Math.max(
        0,
        typeof pageIndex === "number"
          ? pageIndex
          : paginationRef.current.pageNumber
      );
      const nextSize =
        typeof newPageSize === "number" && newPageSize > 0
          ? newPageSize
          : paginationRef.current.pageSize;

      fetchInventory(nextPage, nextSize);
    },
    [fetchInventory]
  );

  // =====================
  // RENDER
  // =====================
  return (
    <div style={{ marginTop: 40 }}>
      <ManufacturerInventory
        data={items}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default EVMStaffInventoryContainer;
