import React, { useEffect, useState, useCallback } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
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

  // === Fetch danh sách request ===
  const fetchPartsRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request(ApiEnum.SHOW_REQUEST_PARTS_EVMSTAFF);
      const items = res?.data?.items ?? [];
      setPartsRequests(items);
    } catch (err) {
      console.error("❌ EVMParts fetch error:", err);
      setError("Unable to load parts requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartsRequests();
  }, [fetchPartsRequests]);

  // === Handlers gọi API ===
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      fetchPartsRequests();
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
      fetchPartsRequests();
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
      fetchPartsRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert(
        `❌ Error: ${err.responseData?.message || "Failed to mark delivered"}`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // === UI render ===
  return (
    <>
      <PartsListEVM
        data={partsRequests}
        loading={loading}
        error={error}
        onView={(req) => setSelectedRequest(req)}
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
