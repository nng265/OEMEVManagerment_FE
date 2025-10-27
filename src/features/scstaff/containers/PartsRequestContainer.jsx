import React, { useState, useEffect, useMemo } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { PartsRequestList } from "../components/PartsRequestList";
import { PartsRequestDetailModal } from "../components/PartsRequestDetailModal";
import { Button } from "../../../components/atoms/Button/Button";
import { formatDate } from "../../../utils/helpers";

export const PartsRequestContainer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchPartsRequests(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchPartsRequests = async (page, size) => {
    setLoading(true);
    setError(null);
    try {
      const apiPage = page - 1;
      const response = await request(ApiEnum.SHOW_REQUEST_PARTS_SCSTAFF, {
        Page: apiPage,
        Size: size,
      });

      if (response.success && response.data) {
        const items = response.data.items || [];
        const processedItems = items.map((request) => ({
          ...request,
          totalQuantity:
            request.totalItems ??
            (Array.isArray(request.partOrderItems)
              ? request.partOrderItems.length
              : 0),
        }));
        setRequests(processedItems);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        setError(response.message || "Unable to load parts requests");
        setRequests([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Error fetching parts requests:", err);
      setError("An error occurred while loading the request list.");
      setRequests([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleViewDetail = (requestData) => {
    const timelineEvents = [];
    const currentStatus = (requestData.status || "").trim().toLowerCase();
    if (requestData.requestDate) {
      timelineEvents.push({
        status: "Request Created",
        date: requestData.requestDate,
      });
    }
    if (requestData.approvedDate) {
      timelineEvents.push({
        status: "Confirmed by EVM",
        date: requestData.approvedDate,
      });
    }
    if (requestData.shippedDate) {
      timelineEvents.push({
        status: "Shipped by Manufacturer",
        date: requestData.shippedDate,
      });
    }
    if (
      requestData.partDelivery &&
      (currentStatus === "delivered" || currentStatus === "deliverd")
    ) {
      timelineEvents.push({
        status: "Parts Delivered",
        date: requestData.partDelivery,
      });
    }

    const normalizedData = {
      ...requestData,
      requestID: requestData.orderId,
      timeline: timelineEvents,
      expectedDate: requestData.expectedDate,
    };

    setSelectedRequest(normalizedData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };
  const handleConfirmDelivered = async (requestId) => {
    setIsActionLoading(true);
    try {
      const response = await request(ApiEnum.CONFIRM_PART_ORDER_DELIVERED, {
        params: { orderId: requestId },
      });
      if (response.success) {
        alert("Confirmation Successful!");
        handleCloseModal();
        fetchPartsRequests(currentPage, pageSize);
      } else {
        alert(
          "Confirmation Failed: " + (response.message || "Please try again.")
        );
      }
    } catch (err) {
      console.error("Error confirming receipt:", err);
      alert(
        "An error occurred: " +
          (err.responseData?.message || err.message || "Unknown error")
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "totalQuantity",
        label: "Items",
        sortable: true,
        render: (val) => `${val || 0} part(s)`,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value) => {
          const normalizedStatus = (value || "unknown").trim().toLowerCase();
          let displayText = value;
          if (normalizedStatus === "deliverd") {
            displayText = "Delivered";
          }
          const statusClass = normalizedStatus.replace(/_/g, "-");
          return (
            <span className={`status-badge status-${statusClass}`}>
              {displayText}
            </span>
          );
        },
      },
      {
        key: "requestDate",
        label: "Requested Date",
        sortable: true,
        render: (val) =>
          val
            ? formatDate(val, "vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-",
      },
      {
        key: "expectedDate",
        label: "Expected Delivery",
        sortable: true,
        render: (val) =>
          val
            ? formatDate(val, "vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
          >
            View
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
        error={error}
        paginationServer
        totalRecords={totalRecords}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {isModalOpen && selectedRequest && (
        <PartsRequestDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          requestData={selectedRequest}
          onConfirmDelivered={handleConfirmDelivered}
          isConfirming={isActionLoading}
        />
      )}
    </>
  );
};

export default PartsRequestContainer;
