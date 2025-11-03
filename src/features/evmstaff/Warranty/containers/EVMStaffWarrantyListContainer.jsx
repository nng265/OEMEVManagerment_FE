// src/features/evmStaff/containers/EVMStaffWarrantyListContainer.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import { EVMStaffWarrantyList } from "../components/EVMStaffWarrantyList";
import { EVMStaffConfirmationModal } from "../components/EVMStaffConfirmationModal";
import { toast } from "react-toastify";

export const EVMStaffWarrantyListContainer = () => {
  // === STATE cho Warranty Claims ===
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
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

  // === Fetch danh sách claim ===
  const fetchClaims = useCallback(async (pageNumber = 0, pageSize) => {
    const effectivePageSize =
      typeof pageSize === "number" ? pageSize : paginationRef.current.pageSize;
    setLoading(true);
    setError(null);

    try {
      const res = await request(ApiEnum.GET_WARRANTY_CLAIMS, {
        Page: pageNumber,
        Size: effectivePageSize,
      });

      const { success, items, totalRecords, page, size, message } =
        normalizePagedResult(res, []);

      if (success) {
        setClaims(items);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize:
            typeof size === "number" && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } else {
        setClaims([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load claims");
      }
    } catch (err) {
      console.error("❌ EVMStaff fetch claims error:", err);
      const message =
        err?.responseData?.message || err?.message || "Unable to load claims";
      setClaims([]);
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

  // === Load lần đầu ===
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchClaims(0, paginationRef.current.pageSize);
  }, [fetchClaims]);

  // === Các handler API ===
  const handleApprove = async (claimId, vehicleWarrantyId) => {
    setIsActionLoading(true);
    try {
      const payload = { params: { claimId }, vehicleWarrantyId };
      await request(ApiEnum.APPROVE_WARRANTY_CLAIM, payload);
      setSelectedClaim(null);
      const { pageNumber, pageSize } = paginationRef.current;
      fetchClaims(pageNumber, pageSize);
      toast.success("Claim approved successfully!");
    } catch (err) {
      const errorMsg = err.responseData?.message || "Failed to approve";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeny = async (claimId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.DENY_WARRANTY, { params: { claimId } });
      setSelectedClaim(null);
      const { pageNumber, pageSize } = paginationRef.current;
      fetchClaims(pageNumber, pageSize);
      toast.success("Claim denied successfully!");
    } catch (err) {
      const errorMsg = err.responseData?.message || "Failed to deny";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNeedMoreInfo = async (claimId, reason) => {
    setIsActionLoading(true);
    try {
      const payload = { params: { claimId }, description: reason };
      await request(ApiEnum.BACK_WARRANTY, payload);
      setSelectedClaim(null);
      const { pageNumber, pageSize } = paginationRef.current;
      fetchClaims(pageNumber, pageSize);
      toast.success("Reason submitted. Request sent back for more info.");
    } catch (err) {
      const errorMsg = err.responseData?.message || "Failed to send back";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchClaims(page, size);
    },
    [fetchClaims]
  );

  // === UI render ===
  return (
    <>
      <EVMStaffWarrantyList
        data={claims}
        loading={loading}
        error={error}
        onView={(claim) => setSelectedClaim(claim)}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <EVMStaffConfirmationModal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        warrantyData={selectedClaim}
        isLoading={isActionLoading}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onNeedMoreInfo={handleNeedMoreInfo}
      />
    </>
  );
};

export default EVMStaffWarrantyListContainer;
