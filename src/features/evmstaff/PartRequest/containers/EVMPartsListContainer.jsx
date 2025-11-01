import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import PartsListEVM from "../components/PartsListEVM";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed from "../components/Confirmed";
import Delivered from "../components/Delivered";
import { toast } from "react-toastify"; // Import toast

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
  }, []); // Removed paginationRef.current.pageSize from dependencies

  useEffect(() => {
    // Reset page number to 0 when component mounts or fetch function changes
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(0, paginationRef.current.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPartsRequests]); // Only refetch when fetchPartsRequests changes (usually once)

  // === Handlers gọi API ===
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize); // Refetch current page
      setSelectedRequest(null);
      toast.success("Expected date updated successfully!"); // Use toast for success
    } catch (err) {
      const errorMsg =
        err.responseData?.message || "Failed to set requested date";
      toast.error(`Error: ${errorMsg}`); // Use toast for error
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
      fetchPartsRequests(pageNumber, pageSize); // Refetch current page
      setSelectedRequest(null);
      toast.success("Request confirmed and moved to preparation!"); // Use toast for success
    } catch (err) {
      const errorMsg = err.responseData?.message || "Failed to confirm";
      toast.error(`Error: ${errorMsg}`); // Use toast for error
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
      fetchPartsRequests(pageNumber, pageSize); // Refetch current page
      setSelectedRequest(null);
      toast.success("Request marked as delivered!"); // Use toast for success
    } catch (err) {
      const errorMsg = err.responseData?.message || "Failed to mark delivered";
      toast.error(`Error: ${errorMsg}`); // Use toast for error
    } finally {
      setIsActionLoading(false);
    }
  };

  // Callback for DataTable's onPageChange
  const handlePageChange = useCallback(
    (page, size) => {
      // Check if page or size actually changed before fetching
      if (
        page !== paginationRef.current.pageNumber ||
        size !== paginationRef.current.pageSize
      ) {
        fetchPartsRequests(page, size);
      }
    },
    [fetchPartsRequests] // Dependency on fetchPartsRequests
  );

  // === UI render ===
  return (
    <>
      <PartsListEVM
        data={partsRequests}
        loading={loading}
        error={error}
        onView={(req) => setSelectedRequest(req)} // Pass request data to handler
        pagination={pagination}
        onPageChange={handlePageChange} // Pass handler to DataTable
      />

      {/* Render modals based on selectedRequest status */}
      {/* Ensure these custom modals are potentially refactored to use the standard Modal component */}
      {selectedRequest?.status === "Pending" && (
        <Pending
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSetDate={handleSetRequestedDate}
          onConfirm={handleConfirmAndPrepare}
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Waiting" && (
        <Waiting
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSetDate={handleSetRequestedDate}
          onConfirm={handleConfirmAndPrepare} // Assuming same confirmation action
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Confirmed" && (
        <Confirmed // Assuming 'Confirmed' is the correct component name
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDelivered={handleDelivered} // Pass delivery handler
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Delivered" && (
        <Delivered
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          // onDelivered={handleDelivered} // Might not need action here, depends on workflow
          isLoading={isActionLoading} // Pass loading state if there are actions
        />
      )}
    </>
  );
};

export default EVMPartsListContainer;
