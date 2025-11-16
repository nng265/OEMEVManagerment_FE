import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import PartsListEVM from "../components/PartsListEVM";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed, { Comfirm } from "../components/Confirmed";
import Delivered from "../components/Delivered";
import { toast } from "react-toastify";

export const EVMPartsListContainer = () => {
  const [partsRequests, setPartsRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const paginationRef = useRef(pagination);
  const searchRef = useRef("");

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  // Debounce search query để tránh request liên tục
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay 500ms sau khi user ngừng gõ

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // === Fetch danh sách request ===
  const fetchPartsRequests = useCallback(async (pageNumber = 0, pageSize, search) => {
    const effectivePageSize =
      typeof pageSize === "number" && pageSize > 0
        ? pageSize
        : paginationRef.current.pageSize;
    const effectiveSearch =
      typeof search === "string" ? search : searchRef.current;

    setLoading(true);
    setError(null);
    try {
      const params = {
        Page: pageNumber,
        Size: effectivePageSize,
      };

      // Thêm search query nếu có
      if (effectiveSearch && effectiveSearch.trim()) {
        params.Search = effectiveSearch.trim();
      }

      const res = await request(ApiEnum.GET_REQUEST_PARTS, params);

      const { success, items, totalRecords, page, size, message } =
        normalizePagedResult(res, []);

      if (success) {
        setPartsRequests(items);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize:
            typeof size === "number" && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } else {
        setPartsRequests([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load parts requests");
      }
    } catch (err) {
      console.error("❌ EVMParts fetch error:", err);
      const message =
        err?.responseData?.message ||
        err?.message ||
        "Unable to load parts requests";
      setPartsRequests([]);
      setPagination((prev) => ({
        ...prev,
        pageNumber,
        pageSize: effectivePageSize,
        totalRecords: 0,
      }));
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(0, paginationRef.current.pageSize, debouncedSearchQuery);
  }, [fetchPartsRequests, debouncedSearchQuery]);

  // === Handlers gọi API ===
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize, searchRef.current);
      setSelectedRequest(null);
      toast.success("Expected date updated successfully!");
    } catch (err) {
      // const errorMsg =
      //   err.responseData?.message || "Failed to set requested date";
      // toast.error(`Error: ${errorMsg}`);
      toast.warning(`Error: Please select a valid date`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmAndPrepare = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.CONFIRM_PREPARE, {
        params: { orderId },
      });
      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize, searchRef.current);
      setSelectedRequest(null);
      toast.success("Request confirmed and moved to preparation!");
    } catch (err) {
      // const errorMsg = err.responseData?.message || "Failed to confirm";
      // toast.error(`Error: ${errorMsg}`);
      toast.error(`Error: Unable to confirm request`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelivered = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.DELIVERED_CLICK, {
        params: { orderId },
      });
      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize, searchRef.current);
      setSelectedRequest(null);
      toast.success("Request marked as delivered!");
    } catch (err) {
      // const errorMsg = err.responseData?.message || "Failed to mark delivered";
      // toast.error(`Error: ${errorMsg}`);
      toast.error(`Error: Unable to mark request as delivered`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchPartsRequests(page, size, searchRef.current);
    },
    [fetchPartsRequests]
  );

  const handleRefresh = useCallback(() => {
    fetchPartsRequests(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current
    );
  }, [fetchPartsRequests]);

  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  // === UI render ===
  return (
    <>
      <PartsListEVM
        data={partsRequests}
        loading={loading}
        error={error}
        onView={(req) => setSelectedRequest(req)}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* === Pending Popup === */}
      {selectedRequest?.status === "Pending" && (
        <Pending
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSetDate={handleSetRequestedDate} // ✅ lưu ngày Pending
          onConfirm={handleConfirmAndPrepare}
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Waiting" && (
        <Waiting
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSetDate={handleSetRequestedDate} // ✅ cập nhật ngày Waiting
          onConfirm={handleConfirmAndPrepare}
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Confirmed" && (
        <Confirmed
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDelivered={handleDelivered}
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Delivered" && (
        <Delivered
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDelivered={handleDelivered}
          isLoading={isActionLoading}
        />
      )}
    </>
  );
};

export default EVMPartsListContainer;
