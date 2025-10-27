// src/features/evmStaff/containers/EVMStaffWarrantyListContainer.jsx
import React, { useEffect, useState, useCallback } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { EVMStaffWarrantyList } from "../components/EVMStaffWarrantyList";
import { EVMStaffConfirmationModal } from "../components/EVMStaffConfirmationModal";

export const EVMStaffWarrantyListContainer = () => {
  // === STATE cho Warranty Claims ===
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // === Pagination state ===
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // === Fetch danh sách claim ===
  const fetchClaims = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      console.log(">>> FETCH CLAIMS", page, size);

      const res = await request(ApiEnum.NEED_CONFIRM, {
        params: { Page: page, Size: size },
      });

      const result = res?.data || {};
      console.log(">>> RESPONSE:", result);

      if (result) {
        setClaims(result.items ?? []);
        setPageNumber(result.pageNumber ?? page);
        setPageSize(result.pageSize ?? size);
        setTotalRecords(result.totalRecords ?? 0);
        setTotalPages(result.totalPages ?? 1);
      } else {
        setClaims([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("❌ EVMStaff fetch claims error:", err);
      setError("Unable to load claims");
    } finally {
      setLoading(false);
    }
  }, []);

  // === Load lần đầu ===
  useEffect(() => {
    // Fetch current page when pageNumber or pageSize change
    fetchClaims(pageNumber, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  // === Handler đổi trang ===
  // Ví dụ component Pagination
  const handlePageChange = (newPage) => {
    // Nếu Pagination gửi 1-based index => trừ đi 1
    setPageNumber(newPage - 1); // TODO
  };

  // === Handler đổi số dòng mỗi trang ===
  const handlePageSizeChange = (newSize) => {
    // reset to page 0 and update pageSize; effect will fetch
    setPageSize(newSize);
    setPageNumber(0);
  };

  // === Handler cho các hành động xác nhận / từ chối ===
  const handleApprove = async (claimId, vehicleWarrantyId) => {
    setIsActionLoading(true);
    try {
      const payload = { params: { claimId }, vehicleWarrantyId };
      await request(ApiEnum.APPROVE_WARRANTY_CLAIM, payload);
      setSelectedClaim(null);
      fetchClaims(pageNumber, pageSize);
    } catch (err) {
      alert(`Error: ${err.responseData?.message || "Failed to approve"}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeny = async (claimId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.DENY_WARRANTY, { params: { claimId } });
      setSelectedClaim(null);
      fetchClaims(pageNumber, pageSize);
    } catch (err) {
      alert(`Error: ${err.responseData?.message || "Failed to deny"}`);
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
      fetchClaims(pageNumber, pageSize);
    } catch (err) {
      alert(`Error: ${err.responseData?.message || "Failed to send back"}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // === Render UI ===
  return (
    <>
      <EVMStaffWarrantyList
        data={claims}
        loading={loading}
        error={error}
        onView={(claim) => setSelectedClaim(claim)}
        pageNumber={pageNumber}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
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
