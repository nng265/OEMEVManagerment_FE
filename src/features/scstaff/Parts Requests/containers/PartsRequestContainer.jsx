import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { PartsRequestList } from "../components/PartsRequestList";
import { PartsRequestDetailModal } from "../components/PartsRequestDetailModal";
import { Button } from "../../../../components/atoms/Button/Button";
import { formatDate } from "../../../../services/helpers";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

export const PartsRequestContainer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const pendingRequestIdRef = useRef(null);

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const latestRequestRef = useRef(0);

  const fetchPartsRequests = useCallback(
    async (pageNumber, size) => {
      const effectivePage =
        typeof pageNumber === "number" && pageNumber >= 0 ? pageNumber : 0;
      const effectiveSize =
        typeof size === "number" && size > 0 ? size : pagination.pageSize;

      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      setLoading(true);
      setError(null);
      try {
        const response = await request(ApiEnum.SHOW_REQUEST_PARTS_SCSTAFF, {
          Page: effectivePage,
          Size: effectiveSize,
        });

        if (requestId !== latestRequestRef.current) {
          return;
        }

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
          const total = response.data.totalRecords ?? processedItems.length;
          setPagination({
            pageNumber: effectivePage,
            pageSize: effectiveSize,
            totalRecords: typeof total === "number" ? total : 0,
          });
        } else {
          setError(response.message || "Unable to load parts requests");
          setRequests([]);
          setPagination({
            pageNumber: effectivePage,
            pageSize: effectiveSize,
            totalRecords: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching parts requests:", err);
        if (requestId === latestRequestRef.current) {
          setError("An error occurred while loading the request list.");
          setRequests([]);
          setPagination({
            pageNumber: effectivePage,
            pageSize: effectiveSize,
            totalRecords: 0,
          });
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [pagination.pageSize]
  );

  useEffect(() => {
    fetchPartsRequests(pagination.pageNumber, pagination.pageSize);
  }, [fetchPartsRequests, pagination.pageNumber, pagination.pageSize]);

  const handlePageChange = (pageIndex, newSize) => {
    const nextSize =
      typeof newSize === "number" && newSize > 0
        ? newSize
        : pagination.pageSize;
    const nextPage = Math.max(0, typeof pageIndex === "number" ? pageIndex : 0);

    if (
      pagination.pageNumber === nextPage &&
      pagination.pageSize === nextSize
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      pageNumber: nextPage,
      pageSize: nextSize,
    }));
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
      (currentStatus === "deliverd" || currentStatus === "deliverd")
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
  const handleConfirmDelivered = (requestId) => {
    // Open confirmation dialog first
    pendingRequestIdRef.current = requestId;
    setConfirmTitle("Confirm Delivery");
    setConfirmMessage(`Mark parts request #${requestId} as delivered?`);
    setIsConfirmOpen(true);
  };

  const performConfirmDelivered = async () => {
    const requestId = pendingRequestIdRef.current;
    if (!requestId) {
      setIsConfirmOpen(false);
      return;
    }
    setIsActionLoading(true);
    try {
      const response = await request(ApiEnum.CONFIRM_PART_ORDER_DELIVERED, {
        params: { orderId: requestId },
      });
      if (response.success) {
        toast.success("Confirmation successful!");
        handleCloseModal();
        fetchPartsRequests(pagination.pageNumber, pagination.pageSize);
      } else {
        const msg =
          response.message || "Confirmation failed. Please try again.";
        toast.error(msg);
      }
    } catch (err) {
      console.error("Error confirming receipt:", err);
      const msg = err.responseData?.message || err.message || "Unknown error";
      toast.error(`An error occurred: ${msg}`);
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      pendingRequestIdRef.current = null;
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
        key: "status",
        label: "Status",
        sortable: true,
        render: (value) => {
          const normalizedStatus = (value || "unknown").trim().toLowerCase();
          const statusClass = normalizedStatus.replace(/\s+/g, "-");
          const displayText =
            value && value.length > 0
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : "Unknown";

          return (
            <span className={`status-badge status-${statusClass}`}>
              {displayText}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_, row) => (
          <Button
            variant="light"
            size="sm"
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
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Delivered"
        cancelLabel="Cancel"
        onConfirm={performConfirmDelivered}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default PartsRequestContainer;
