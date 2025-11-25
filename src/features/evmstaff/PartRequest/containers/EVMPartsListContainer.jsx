import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  request,
  uploadFiles,
  ApiEnum,
} from "../../../../services/NetworkUntil";
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

  // Debounce Search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // --- FETCH DATA ---
  const fetchPartsRequests = useCallback(
    async (pageNumber = 0, pageSize, search, status) => {
      const effectivePageSize =
        pageSize > 0 ? pageSize : paginationRef.current.pageSize;
      const effectiveSearch =
        typeof search === "string" ? search : searchRef.current;
      const effectiveStatus =
        typeof status === "string" ? status : statusRef.current;

      setLoading(true);
      setError(null);
      try {
        const params = { Page: pageNumber, Size: effectivePageSize };
        if (effectiveSearch?.trim()) params.Search = effectiveSearch.trim();
        if (effectiveStatus?.trim()) params.Status = effectiveStatus;

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
          setError(message);
        }
      } catch (err) {
        setPartsRequests([]);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- USE EFFECT (FIXED DEPENDENCY) ---
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      debouncedSearchQuery,
      statusFilter
    );
  }, [debouncedSearchQuery, statusFilter, fetchPartsRequests]);

  // --- HANDLERS ---
  const handleSearchChange = (e) => setSearchQuery(e.target.value || "");
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value || "");

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

  // --- ACTIONS ---
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      handleRefresh();
      setSelectedRequest(null);
      toast.success("Updated successfully!");
    } catch {
      toast.warning("Error updating date");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmAndPrepare = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.CONFIRM_PREPARE, { params: { orderId } });
      handleRefresh();
      setSelectedRequest(null);
      toast.success("Confirmed!");
    } catch {
      toast.error("Error confirming");
    } finally {
      setIsActionLoading(false);
    }
  };

  // === VALIDATE SHIPMENT (UPLOAD EXCEL) ===
  const handleValidateShipment = async (orderId, file) => {
    setIsActionLoading(true);
    try {
      // Gọi API Validate (Dùng API mới trong NetworkUntil.js)
      const response = await uploadFiles(ApiEnum.VALIDATE_SHIPMENT, {
        params: { orderId },
        file: file,
      });
      return response;
    } catch (error) {
      console.error(error);
      const msg = error.responseData?.message || "Error validating file";
      return { success: false, message: msg };
    } finally {
      setIsActionLoading(false);
    }
  };

  // === CONFIRM SHIPMENT (GỬI HÀNG) ===
  const handleConfirmShipment = async (orderId) => {
    setIsActionLoading(true);
    try {
      // Gọi API Confirm Shipment để chuyển trạng thái sang In Transit
      await request(ApiEnum.CONFIRM_SHIPMENT, { params: { orderId } }, "PUT");

      handleRefresh();
      setSelectedRequest(null);
      toast.success("Shipment confirmed! Status: In Transit.");
    } catch {
      toast.error("Error confirming shipment");
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

      {/* MODAL CONFIRMED (Đã update logic validate & ship) */}
      {selectedRequest?.status === "Confirmed" && (
        <Confirmed
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onValidate={handleValidateShipment}
          onDelivered={handleConfirmShipment} // Gọi hàm Ship
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Delivered" && (
        <Delivered
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          isLoading={isActionLoading}
        />
      )}
    </>
  );
};

export default EVMPartsListContainer;
