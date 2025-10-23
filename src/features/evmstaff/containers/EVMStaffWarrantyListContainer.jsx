// src/features/evmStaff/containers/EVMStaffWarrantyListContainer.jsx
import React, { useEffect, useState, useCallback } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { EVMStaffWarrantyList } from "../components/EVMStaffWarrantyList";
import { EVMStaffConfirmationModal } from "../components/EVMStaffConfirmationModal";

export const EVMStaffWarrantyListContainer = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // === Fetch danh sách claim ===
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request(ApiEnum.NEED_CONFIRM);
      const data = res?.data ?? res ?? [];
      setClaims(data);
    } catch (err) {
      console.error("❌ EVMStaff fetch claims error:", err);
      setError("Unable to load claims");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // === Các handler API ===
  const handleApprove = async (claimId, vehicleWarrantyId) => {
    setIsActionLoading(true);
    try {
      const payload = { params: { claimId }, vehicleWarrantyId };
      await request(ApiEnum.APPROVE_WARRANTY, payload);
      setSelectedClaim(null);
      fetchClaims();
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
      fetchClaims();
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
      fetchClaims();
    } catch (err) {
      alert(`Error: ${err.responseData?.message || "Failed to send back"}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // === UI render ===
  return (
    <>
      <EVMStaffWarrantyList
        data={claims}
        loading={loading}
        error={error}
        onView={(claim) => setSelectedClaim(claim)}
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

