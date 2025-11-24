import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import PartsListEVM from "../components/PartsListEVM";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed from "../components/Confirmed";
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
  const [statusFilter, setStatusFilter] = useState("");
  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const statusRef = useRef("");

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  useEffect(() => {
    statusRef.current = statusFilter;
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchPartsRequests = useCallback(
    async (pageNumber = 0, pageSize, search, status) => {
      const effectivePageSize =
        typeof pageSize === "number" && pageSize > 0
          ? pageSize
          : paginationRef.current.pageSize;

      const effectiveSearch =
        typeof search === "string" ? search : searchRef.current;

      const effectiveStatus =
        typeof status === "string" ? status : statusRef.current;

      setLoading(true);
      setError(null);

      try {
        const params = {
          Page: pageNumber,
          Size: effectivePageSize,
        };

        if (effectiveSearch && effectiveSearch.trim()) {
          params.Search = effectiveSearch.trim();
        }

        // ⭐ NEW: add Status param
        if (effectiveStatus && effectiveStatus.trim()) {
          params.Status = effectiveStatus;
        }
        console.log("🔎 Fetch Params:", params);
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
          setPagination({
            pageNumber,
            pageSize: effectivePageSize,
            totalRecords: 0,
          });
          setError(message || "Unable to load parts requests");
        }
      } catch (err) {
        console.error("❌ EVMParts fetch error:", err);
        const message =
          err?.responseData?.message ||
          err?.message ||
          "Unable to load parts requests";
        setPartsRequests([]);
        setPagination({
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        });
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      debouncedSearchQuery,
      statusFilter
    );
  }, [debouncedSearchQuery]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      searchRef.current,
      statusFilter
    );
  }, [statusFilter]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value || "");
  };

  // ⭐ NEW: status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value || "");
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchPartsRequests(page, size, searchRef.current, statusRef.current);
    },
    [fetchPartsRequests]
  );

  const handleRefresh = useCallback(() => {
    fetchPartsRequests(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      statusRef.current
    );
  }, [fetchPartsRequests]);

  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });

      const { pageNumber, pageSize } = paginationRef.current;
      fetchPartsRequests(pageNumber, pageSize, searchRef.current, statusRef.current);
      setSelectedRequest(null);
      toast.success("Expected date updated successfully!");
    } catch {
      toast.warning("Error: Please select a valid date");
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
      fetchPartsRequests(pageNumber, pageSize, searchRef.current, statusRef.current);
      setSelectedRequest(null);
      toast.success("Request confirmed and moved to preparation!");
    } catch {
      toast.error("Error: Unable to confirm request");
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
      fetchPartsRequests(pageNumber, pageSize, searchRef.current, statusRef.current);
      setSelectedRequest(null);
      toast.success("Request marked as delivered!");
    } catch {
      toast.error("Error: Unable to mark request as delivered");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <PartsListEVM
        data={partsRequests}
        loading={loading}
        error={error}
        onView={setSelectedRequest}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}

        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

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
