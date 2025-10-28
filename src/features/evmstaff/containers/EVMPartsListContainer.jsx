import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../services/helpers";
import PartsListEVM from "../components/PartsListEVM";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed, { Comfirm } from "../components/Confirmed";
import Delivered from "../components/Delivered";

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
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // === Fetch danh sách request ===
  const fetchPartsRequests = useCallback(async (pageNumber = 0, pageSize) => {
    const effectivePageSize =
      typeof pageSize === "number" && pageSize > 0
        ? pageSize
        : paginationRef.current.pageSize;

    setLoading(true);
    setError(null);
    try {
      const res = await request(ApiEnum.SHOW_REQUEST_PARTS_EVMSTAFF, {
        Page: pageNumber,
        Size: effectivePageSize,
      });

      const {
        success,
        items,
        totalRecords,
        page,
        size,
        message,
      } = normalizePagedResult(res, []);

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
    fetchPartsRequests(0, paginationRef.current.pageSize);
  }, [fetchPartsRequests]);

  // === Handlers gọi API ===
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize);
      setSelectedRequest(null);
    } catch (err) {
      alert(
        `❌ Error: ${
          err.responseData?.message || "Failed to set requested date"
        }`
      );
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
      fetchPartsRequests(pageNumber, pageSize);
      setSelectedRequest(null);
    } catch (err) {
      alert(`❌ Error: ${err.responseData?.message || "Failed to confirm"}`);
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
      fetchPartsRequests(pageNumber, pageSize);
      setSelectedRequest(null);
    } catch (err) {
      alert(
        `❌ Error: ${err.responseData?.message || "Failed to mark delivered"}`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchPartsRequests(page, size);
    },
    [fetchPartsRequests]
  );

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
