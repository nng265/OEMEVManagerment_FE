import React, { useState, useEffect, useMemo, useCallback } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { PartsRequestList } from "../components/PartsRequestList";
import { PartsRequestDetailModal } from "../components/PartsRequestDetailModal";
import { Button } from "../../../../components/atoms/Button/Button";
// import { formatDate } from "../../../../services/helpers";
import { toast } from "react-toastify";

// --- CONFIG CONSTANTS ---
const MAX_PART_QUANTITY = 50;

export const PartsRequestContainer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  // --- 1. FETCH LIST ---
  const fetchPartsRequests = useCallback(async (page, size) => {
    setLoading(true);
    try {
      const response = await request(
        ApiEnum.GET_REQUEST_PARTS,
        { Page: page, Size: size },
        "GET"
      );

      if (response.success && response.data) {
        setRequests(response.data.items || []);
        setPagination({
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalRecords: response.data.totalRecords,
        });
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading parts requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartsRequests(pagination.pageNumber, pagination.pageSize);
  }, [pagination.pageNumber, pagination.pageSize, fetchPartsRequests]);

  // --- 2. PREPARE DATA FOR MODAL ---
  const handleViewDetail = (row) => {
    const timelineEvents = [];

    if (row.requestDate)
      timelineEvents.push({ status: "Request Created", date: row.requestDate });
    if (row.approvedDate)
      timelineEvents.push({ status: "Confirmed", date: row.approvedDate });
    if (row.shippedDate)
      timelineEvents.push({ status: "In Transit", date: row.shippedDate });
    if (row.partDelivery)
      timelineEvents.push({ status: "Delivered", date: row.partDelivery });
    if (row.status === "Done" && !row.partDelivery)
      timelineEvents.push({ status: "Done", date: new Date().toISOString() });

    const normalizedData = {
      ...row,
      requestID: row.orderId,
      timeline: timelineEvents,
    };

    setSelectedRequest(normalizedData);
    setIsModalOpen(true);
  };

  // --- 3. COLUMN CONFIGURATION (Đã bỏ Quantity & Giờ) ---
  const columns = useMemo(
    () => [
      {
        key: "serviceCenterName",
        label: "Service Center",
        sortable: true,
      },
      // ĐÃ XÓA CỘT QUANTITY Ở ĐÂY
      {
        key: "requestDate",
        label: "Created Date",
        // Chỉ hiện ngày (MM/DD/YYYY)
        render: (val) =>
          val ? new Date(val).toLocaleDateString("en-US") : "-",
      },
      {
        key: "expectedDate",
        label: "Expected Date",
        // Chỉ hiện ngày (MM/DD/YYYY)
        render: (val) =>
          val ? new Date(val).toLocaleDateString("en-US") : "N/A",
      },
      {
        key: "status",
        label: "Status",
        render: (value) => {
          const s = (value || "").toLowerCase();
          let className = "status-unknown";

          if (s === "waiting") className = "status-waiting";
          else if (s === "confirmed") className = "status-confirmed";
          else if (s === "in transit") className = "status-waiting";
          else if (s === "delivered") className = "status-delivered";
          else if (s === "done") className = "status-success";
          else if (s === "cancelled") className = "status-cancelled";

          return <span className={`status-badge ${className}`}>{value}</span>;
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <Button
            variant="light"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
          >
            <img
              src="../../../../../public/eye.png"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PartsRequestList
        data={requests}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(p, s) =>
          setPagination((prev) => ({ ...prev, pageNumber: p, pageSize: s }))
        }
        onRefresh={() =>
          fetchPartsRequests(pagination.pageNumber, pagination.pageSize)
        }
      />

      {isModalOpen && selectedRequest && (
        <PartsRequestDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          requestData={selectedRequest}
          onRefresh={() =>
            fetchPartsRequests(pagination.pageNumber, pagination.pageSize)
          }
        />
      )}
    </>
  );
};
