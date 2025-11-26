import React, { useState, useEffect, useMemo, useCallback } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { PartsRequestList } from "../components/PartsRequestList";
import { PartsRequestDetailModal } from "../components/PartsRequestDetailModal";
import { Button } from "../../../../components/atoms/Button/Button";
import { toast } from "react-toastify";

export const PartsRequestContainer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    pageNumber: 1,
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
    // Tạo timeline giả lập từ dữ liệu row (nếu BE chưa trả về list timeline)
    const timelineEvents = [];

    if (row.requestDate)
      timelineEvents.push({ status: "Request Created", date: row.requestDate });
    if (row.approvedDate)
      timelineEvents.push({ status: "Confirmed", date: row.approvedDate });
    if (row.shippedDate)
      timelineEvents.push({ status: "In Transit", date: row.shippedDate });
    if (row.partDelivery)
      timelineEvents.push({ status: "Delivered", date: row.partDelivery });
    if (row.status === "Done" || row.status === "Closed")
      timelineEvents.push({
        status: row.status,
        date: row.updatedAt || new Date().toISOString(),
      });

    // Chuẩn hóa dữ liệu để truyền vào Modal
    // QUAN TRỌNG: Map orderId -> requestID để Modal gọi API
    const normalizedData = {
      ...row,
      requestID: row.orderId,
      timeline: timelineEvents,
    };

    setSelectedRequest(normalizedData);
    setIsModalOpen(true);
  };

  // --- 3. COLUMN CONFIGURATION ---
  const columns = useMemo(
    () => [
      {
        key: "serviceCenterName",
        label: "Service Center",
        sortable: true,
      },
      {
        key: "requestDate",
        label: "Created Date",
        render: (val) =>
          val ? new Date(val).toLocaleDateString("en-US") : "-",
      },
      {
        key: "expectedDate",
        label: "Expected Date",
        render: (val) =>
          val ? new Date(val).toLocaleDateString("en-US") : "N/A",
      },
      {
        key: "status",
        label: "Status",
        render: (value) => {
          const s = (value || "").toLowerCase().trim();
          let className = "status-badge";

          // Map status với class CSS trong PartsRequest.css
          if (s === "pending") className += " status-pending"; // Vàng
          else if (s === "waiting")
            className += " status-waiting"; // Xanh dương nhạt
          else if (s === "confirmed")
            className += " status-confirmed"; // Xanh lá mạ
          else if (s === "in transit")
            className += " status-waiting"; // Xanh dương (dùng chung waiting)
          else if (s === "delivered")
            className += " status-delivered"; // Xanh lá đậm
          else if (s === "done" || s === "closed")
            className += " status-delivered"; // Xanh lá đậm
          else if (s === "cancelled") className += " status-cancelled"; // Đỏ
          else if (s === "returning") className += " status-returning"; // Cam

          return <span className={className}>{value}</span>;
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
              alt="View"
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

export default PartsRequestContainer;
