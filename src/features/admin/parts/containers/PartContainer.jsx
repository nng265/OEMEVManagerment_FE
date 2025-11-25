// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import { normalizePagedResult } from "../../../../services/helpers";
// import PartList from "../components/PartList";
// import InTransit from "../components/InTransit";
// import Discrepancy from "../components/Discrepancy";
// import Pending from "../components/Pending";
// import Waiting from "../components/Waiting";
// import Confirmed from "../components/Confirmed";
// import Delivered from "../components/Delivered";
// import Cancelled from "../components/Cancelled";
// import { toast } from "react-toastify";

// export const PartContainer = () => {
//   // Dev-only: set to true to inject a sample IN_TRANSIT request for testing
//   const ENABLE_INTRANSIT_MOCK = true;

//   const [partsRequests, setPartsRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [isActionLoading, setIsActionLoading] = useState(false);

//   const [pagination, setPagination] = useState({
//     pageNumber: 0,
//     pageSize: 10,
//     totalRecords: 0,
//   });

//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");

//   const paginationRef = useRef(pagination);
//   const searchRef = useRef("");
//   const statusRef = useRef("");

//   // Reason dropdown (cho InTransit)
//   const [reasonOptions, setReasonOptions] = useState([]);
//   const [loadingReasons, setLoadingReasons] = useState(false);
//   const [reasonError, setReasonError] = useState("");

//   useEffect(() => {
//     paginationRef.current = pagination;
//   }, [pagination]);

//   useEffect(() => {
//     searchRef.current = debouncedSearchQuery;
//   }, [debouncedSearchQuery]);

//   useEffect(() => {
//     statusRef.current = statusFilter;
//   }, [statusFilter]);

//   // Debounce search
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setDebouncedSearchQuery(searchQuery);
//     }, 500);
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   const fetchPartsRequests = useCallback(
//     async (pageNumber = 0, pageSize, search, status) => {
//       const effectivePageSize =
//         typeof pageSize === "number" && pageSize > 0
//           ? pageSize
//           : paginationRef.current.pageSize;

//       const effectiveSearch =
//         typeof search === "string" ? search : searchRef.current;

//       const effectiveStatus =
//         typeof status === "string" ? status : statusRef.current;

//       setLoading(true);
//       setError(null);

//       try {
//         const params = {
//           Page: pageNumber,
//           Size: effectivePageSize,
//         };

//         if (effectiveSearch && effectiveSearch.trim()) {
//           params.Search = effectiveSearch.trim();
//         }

//         if (effectiveStatus && effectiveStatus.trim()) {
//           params.Status = effectiveStatus;
//         }

//         const res = await request(ApiEnum.GET_REQUEST_PARTS, params);

//         const { success, items, totalRecords, page, size, message } =
//           normalizePagedResult(res, []);

//         if (success) {
//           let resultItems = items;

//           // ----- MOCK DATA (Dev only) -----
//           if (ENABLE_INTRANSIT_MOCK) {
//             const hasDiscrepancy = (items || []).some(
//               (x) => (x.status || "").toLowerCase() === "discrepancy"
//             );

//             // 👉 Chỉ mock DISCREPANCY — KHÔNG mock In Transit nữa
//             if (!hasDiscrepancy) {
//               resultItems = [
//                 {
//                   orderId: "RTN-001",
//                   serviceCenterName: "SC Di An",
//                   createdByName: "SC Manager Tran",
//                   totalItems: 2,
//                   status: "Discrepancy",
//                   requestDate: "2024-05-25",
//                   expectedDate: "2024-05-25",
//                   receivedDate: "2024-05-25",
//                   partOrderItems: [
//                     { model: "ECU-PRO", requestedQty: 1, oemStock: 0 },
//                     { model: "ENG-V8", requestedQty: 1, oemStock: 0 },
//                   ],
//                   issues: [
//                     {
//                       type: "THIẾU HÀNG ",
//                       quantity: 1,
//                       model: "ECU-PRO",
//                       serial: "ECU999888",
//                       note: "Đã lục soát kỹ thùng hàng và pallet, không thấy.",
//                     },
//                     {
//                       type: "HƯ HỎNG ",
//                       quantity: 1,
//                       model: "ENG-V8",
//                       serial: "SN123456789",
//                       note: "Vỡ góc. Kèm ảnh.",
//                     },
//                   ],
//                   activityLog: [
//                     {
//                       role: "SC Mgr",
//                       time: new Date().toISOString(),
//                       message:
//                         "Đã checklist camera đóng gói xác nhận ECU có bỏ vào.",
//                     },
//                     {
//                       role: "SC Mgr",
//                       time: new Date().toISOString(),
//                       message: "Có thể review footage bóc xếp:",
//                       link: "#",
//                     },
//                     {
//                       role: "OEM Mgr",
//                       time: new Date().toISOString(),
//                       message:
//                         "Đã nhận thông tin. Với cái động cơ bị vỡ, thùng ngoài cũng vỡ, khả năng cao do vận chuyển.",
//                     },
//                   ],
//                   finalDecision: {
//                     ecuDecision: "Yêu cầu SC gửi bù",
//                     engDecision: "Lỗi vận chuyển (Claim)",
//                     notes:
//                       "Chốt: ECU báo mất do vận chuyển. ENG claim bảo hiểm.",
//                   },
//                   remarks: "Mock discrepancy record for testing",
//                 },
//                 ...resultItems,
//               ];
//             }
//           }
//           // ---------------------------------

//           setPartsRequests(resultItems);
//           setPagination({
//             pageNumber: typeof page === "number" ? page : pageNumber,
//             pageSize:
//               typeof size === "number" && size > 0 ? size : effectivePageSize,
//             totalRecords:
//               typeof totalRecords === "number"
//                 ? totalRecords
//                 : resultItems.length,
//           });
//         } else {
//           setPartsRequests([]);
//           setPagination({
//             pageNumber,
//             pageSize: effectivePageSize,
//             totalRecords: 0,
//           });
//           setError(message || "Unable to load parts requests");
//         }
//       } catch (err) {
//         console.error("❌ EVMParts fetch error:", err);

//         const message =
//           err?.responseData?.message ||
//           err?.message ||
//           "Unable to load parts requests";

//         setPartsRequests([]);
//         setPagination({
//           pageNumber,
//           pageSize: effectivePageSize,
//           totalRecords: 0,
//         });
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     setPagination((prev) => ({ ...prev, pageNumber: 0 }));
//     fetchPartsRequests(
//       0,
//       paginationRef.current.pageSize,
//       debouncedSearchQuery,
//       statusFilter
//     );
//   }, [debouncedSearchQuery]);

//   useEffect(() => {
//     setPagination((prev) => ({ ...prev, pageNumber: 0 }));
//     fetchPartsRequests(
//       0,
//       paginationRef.current.pageSize,
//       searchRef.current,
//       statusFilter
//     );
//   }, [statusFilter]);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value || "");
//   };

//   const handleStatusFilterChange = (e) => {
//     setStatusFilter(e.target.value || "");
//   };

//   const handlePageChange = useCallback(
//     (page, size) => {
//       fetchPartsRequests(page, size, searchRef.current, statusRef.current);
//     },
//     [fetchPartsRequests]
//   );

//   const handleRefresh = useCallback(() => {
//     fetchPartsRequests(
//       paginationRef.current.pageNumber,
//       paginationRef.current.pageSize,
//       searchRef.current,
//       statusRef.current
//     );
//   }, [fetchPartsRequests]);

//   const handleSetRequestedDate = async (orderId, requestedDate) => {
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.UPDATE_REQUESTED_DATE, {
//         params: { orderId },
//         expectedDate: requestedDate,
//       });

//       const { pageNumber, pageSize } = paginationRef.current;
//       fetchPartsRequests(
//         pageNumber,
//         pageSize,
//         searchRef.current,
//         statusRef.current
//       );
//       setSelectedRequest(null);
//       toast.success("Expected date updated successfully!");
//     } catch {
//       toast.warning("Error: Please select a valid date");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handleConfirmAndPrepare = async (orderId) => {
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.CONFIRM_PREPARE, { params: { orderId } });

//       const { pageNumber, pageSize } = paginationRef.current;
//       fetchPartsRequests(
//         pageNumber,
//         pageSize,
//         searchRef.current,
//         statusRef.current
//       );
//       setSelectedRequest(null);
//       toast.success("Request confirmed and moved to preparation!");
//     } catch {
//       toast.error("Error: Unable to confirm request");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handleDelivered = async (orderId) => {
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.DELIVERED_CLICK, { params: { orderId } });

//       const { pageNumber, pageSize } = paginationRef.current;
//       fetchPartsRequests(
//         pageNumber,
//         pageSize,
//         searchRef.current,
//         statusRef.current
//       );
//       setSelectedRequest(null);
//       toast.success("Request marked as delivered!");
//     } catch {
//       toast.error("Error: Unable to mark request as delivered");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ---------------------------- FETCH REASON OPTIONS HERE -----------------------------
//   const fetchReasonOptions = useCallback(async () => {
//     if (loadingReasons || reasonOptions.length > 0) return;

//     setLoadingReasons(true);
//     setReasonError("");

//     try {
//       const res = await request(ApiEnum.GET_CANCEL);
//       const raw = res?.data || res || [];

//       const arr = (Array.isArray(raw) ? raw : [])
//         .map((r) => {
//           if (typeof r === "string") return { value: r, label: r };
//           return {
//             value: r.code || r.value || r.id || r.reason || r.name,
//             label:
//               r.label ||
//               r.name ||
//               r.title ||
//               r.displayName ||
//               r.description ||
//               r.reason ||
//               r.value ||
//               r.code ||
//               "(Unknown)",
//           };
//         })
//         .filter((x) => x.value);

//       setReasonOptions(arr);
//     } catch {
//       setReasonError("Cannot load reason options.");
//     } finally {
//       setLoadingReasons(false);
//     }
//   }, [loadingReasons, reasonOptions.length]);

//   // const handleReportIncident = async ({ orderId, reason, notes }) => {
//   //   if (!orderId || !reason) {
//   //     toast.error("Missing orderId or reason.");
//   //     return;
//   //   }
//   //   setIsActionLoading(true);
//   //   try {
//   //     await request(ApiEnum.RESOLVE_DISCREPANCY, {
//   //       params: { orderID: orderId },
//   //       Reason: reason,
//   //       Notes: notes?.trim() || null,
//   //     });
//   //     toast.success("Incident reported & resolution requested successfully!");
//   //     const { pageNumber, pageSize } = paginationRef.current;
//   //     fetchPartsRequests(
//   //       pageNumber,
//   //       pageSize,
//   //       searchRef.current,
//   //       statusRef.current
//   //     );
//   //     setSelectedRequest(null);
//   //   } catch (err) {
//   //     console.error("REPORT_ISSUE error:", err);
//   //     toast.error(
//   //       err?.responseData?.message || err?.message || "Cannot report incident"
//   //     );
//   //   } finally {
//   //     setIsActionLoading(false);
//   //   }
//   // };

//   const handleResolveDiscrepancy = async ({
//     orderId,
//     partResolutions,
//     overallNote,
//   }) => {
//     if (!orderId || !Array.isArray(partResolutions)) {
//       toast.error("Missing orderId or part resolution data.");
//       return;
//     }

//     setIsActionLoading(true);

//     try {
//       await request(ApiEnum.RESOLVE_DISCREPANCY, {
//         params: { orderID: orderId },
//         partResolutions,
//         overallNote: overallNote || null,
//       });

//       toast.success("Discrepancy resolved successfully!");

//       const { pageNumber, pageSize } = paginationRef.current;
//       fetchPartsRequests(
//         pageNumber,
//         pageSize,
//         searchRef.current,
//         statusRef.current
//       );

//       setSelectedRequest(null);
//     } catch (err) {
//       console.error("RESOLVE_DISCREPANCY error:", err);
//       toast.error(
//         err?.responseData?.message ||
//           err?.message ||
//           "Cannot resolve discrepancy"
//       );
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ------------------------------------------------------------
//   // CANCEL SHIPMENT (admin In Transit: confirm report & accept loss)
//   // ------------------------------------------------------------
//   const handleCancelShipment = async ({
//     orderId,
//     reason,
//     reasonDetail,
//     note,
//   }) => {
//     if (!orderId || !reason) {
//       toast.error("Missing orderId or reason.");
//       return;
//     }
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.CANCEL_SHIPEMENT, {
//         params: { orderID: orderId },
//         orderId,
//         reason,
//         reasonDetail: reason === "Other" ? reasonDetail || null : null,
//         note: note?.trim() || null,
//       });

//       toast.success("Shipment cancelled and loss accepted successfully!");
//       const { pageNumber, pageSize } = paginationRef.current;
//       fetchPartsRequests(
//         pageNumber,
//         pageSize,
//         searchRef.current,
//         statusRef.current
//       );
//       setSelectedRequest(null);
//     } catch (err) {
//       console.error("CANCEL_SHIPEMENT error:", err);
//       toast.error(
//         err?.responseData?.message || err?.message || "Cannot cancel shipment"
//       );
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // // Fetch single PartOrder by ID and show detail modal
//   // const handleViewRequest = async (order) => {
//   //   // `order` may be the row.raw or an id string
//   //   const orderId = (order && (order.orderId || order)) || null;
//   //   if (!orderId) {
//   //     toast.error("Missing orderId to view details");
//   //     return;
//   //   }

//   //   setIsActionLoading(true);
//   //   try {
//   //     const res = await request(ApiEnum.GET_PART_ORDER_BY_ID, {
//   //       params: { orderID: orderId },
//   //     });
//   //     // res should be the part order object
//   //     setSelectedRequest(res || null);
//   //   } catch (err) {
//   //     console.error("GET_PART_ORDER_BY_ID error:", err);
//   //     toast.error(
//   //       err?.responseData?.message || err?.message || "Unable to load details"
//   //     );
//   //   } finally {
//   //     setIsActionLoading(false);
//   //   }
//   // };

//   const SPECIAL_STATUSES = ["Cancelled", "Return", "Discrepancy"];

//   const handleViewDetail = async (order) => {
//     try {
//       setIsActionLoading(true);

//       const { status, orderId } = order;
//       let detailData = order;

//       // Chỉ các status đặc biệt mới gọi Detail API
//       if (SPECIAL_STATUSES.includes(status)) {
//         const res = await request(ApiEnum.GET_PART_ORDER_BY_ID, {
//           params: { orderID: orderId },
//         });

//         if (res?.success) {
//           detailData = res.data;
//         }
//       }

//       setSelectedRequest(detailData);
//     } catch (err) {
//       console.error("Failed to load order detail", err);
//       toast.error("Unable to load order detail");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   return (
//     <>
//       <PartList
//         data={partsRequests}
//         loading={loading}
//         error={error}
//         // onView={setSelectedRequest}
//         onView={handleViewDetail}
//         pagination={pagination}
//         onPageChange={handlePageChange}
//         onRefresh={handleRefresh}
//         refreshing={loading}
//         searchQuery={searchQuery}
//         onSearchChange={handleSearchChange}
//         statusFilter={statusFilter}
//         onStatusFilterChange={handleStatusFilterChange}
//       />

//       {selectedRequest?.status === "Pending" && (
//         <Pending
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onSetDate={handleSetRequestedDate}
//           onConfirm={handleConfirmAndPrepare}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "Waiting" && (
//         <Waiting
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onSetDate={handleSetRequestedDate}
//           onConfirm={handleConfirmAndPrepare}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "Confirmed" && (
//         <Confirmed
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onDelivered={handleDelivered}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "Delivered" && (
//         <Delivered
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onDelivered={handleDelivered}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "In Transit" && (
//         <InTransit
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           // onReport={handleReportIncident}
//           onCancelShipment={handleCancelShipment}
//           isLoading={isActionLoading}
//           reasonOptions={reasonOptions}
//           loadingReasons={loadingReasons}
//           reasonError={reasonError}
//           onLoadReasons={fetchReasonOptions}
//         />
//       )}

//       {selectedRequest?.status === "Discrepancy" && (
//         <Discrepancy
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           // onReport={handleReportIncident}
//           onReport={handleResolveDiscrepancy}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "Cancelled" && (
//         <Cancelled
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           isLoading={isActionLoading}
//         />
//       )}
//     </>
//   );
// };

// export default PartContainer;

import React, { useEffect, useState, useCallback, useRef } from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";

import PartList from "../components/PartList";
import InTransit from "../components/InTransit";
import Discrepancy from "../components/Discrepancy";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed from "../components/Confirmed";
import Delivered from "../components/Delivered";
import Cancelled from "../components/Cancelled";

import { toast } from "react-toastify";

export const PartContainer = () => {
  // ======================================================
  // STATE
  // ======================================================
  const ENABLE_INTRANSIT_MOCK = true;

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

  // Search + Status
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const statusRef = useRef("");

  // Cancel reason
  const [reasonOptions, setReasonOptions] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [reasonError, setReasonError] = useState("");

  // Status dropdown options
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [statusesError, setStatusesError] = useState("");

  // Discrepancy resolution options
  const [discrepancyOptions, setDiscrepancyOptions] = useState(null);
  const [loadingDiscrepancyOptions, setLoadingDiscrepancyOptions] =
    useState(false);
  const [discrepancyOptionError, setDiscrepancyOptionError] = useState("");

  // ======================================================
  // EFFECT: Sync refs
  // ======================================================
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  useEffect(() => {
    statusRef.current = statusFilter;
  }, [statusFilter]);

  // ======================================================
  // SEARCH DEBOUNCE
  // ======================================================
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ======================================================
  // FETCH PART REQUESTS
  // ======================================================
  const fetchPartsRequests = useCallback(
    async (pageNumber = 0, pageSize, search, status) => {
      const effectiveSize =
        typeof pageSize === "number"
          ? pageSize
          : paginationRef.current.pageSize;

      const effectiveSearch =
        typeof search === "string" ? search : searchRef.current;

      const effectiveStatus =
        typeof status === "string" ? status : statusRef.current;

      setLoading(true);
      setError(null);

      try {
        const params = { Page: pageNumber, Size: effectiveSize };

        if (effectiveSearch.trim()) params.Search = effectiveSearch.trim();
        if (effectiveStatus.trim()) params.Status = effectiveStatus;

        const res = await request(ApiEnum.GET_REQUEST_PARTS, params);

        const { success, items, totalRecords, page, size, message } =
          normalizePagedResult(res, []);

        if (success) {
          let result = items;

          // MOCK discrepancy only
          if (ENABLE_INTRANSIT_MOCK) {
            const hasDis = items?.some(
              (x) => (x.status || "").toLowerCase() === "discrepancy"
            );

            if (!hasDis) {
              result = [
                {
                  orderId: "RTN-001",
                  serviceCenterName: "SC Di An",
                  createdByName: "SC Manager Tran",
                  totalItems: 2,
                  status: "Discrepancy",
                  requestDate: "2024-05-25",
                  expectedDate: "2024-05-25",
                  receivedDate: "2024-05-25",
                  partOrderItems: [
                    { model: "ECU-PRO", requestedQty: 1, oemStock: 0 },
                    { model: "ENG-V8", requestedQty: 1, oemStock: 0 },
                  ],
                  issues: [
                    {
                      type: "THIẾU HÀNG ",
                      quantity: 1,
                      model: "ECU-PRO",
                      serial: "ECU999888",
                      note: "Đã lục soát kỹ thùng hàng...",
                    },
                    {
                      type: "HƯ HỎNG ",
                      quantity: 1,
                      model: "ENG-V8",
                      serial: "SN123456789",
                      note: "Vỡ góc.",
                    },
                  ],
                  activityLog: [],
                  finalDecision: {},
                  remarks: "Mock discrepancy record",
                },
                ...result,
              ];
            }
          }

          setPartsRequests(result);
          setPagination({
            pageNumber: page ?? pageNumber,
            pageSize: size ?? effectiveSize,
            totalRecords: totalRecords ?? result.length,
          });
        } else {
          setPartsRequests([]);
          setPagination((p) => ({ ...p, totalRecords: 0 }));
          setError(message || "Unable to load parts");
        }
      } catch (err) {
        setPartsRequests([]);
        setPagination((p) => ({ ...p, totalRecords: 0 }));
        setError(err?.message || "Unable to load parts");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto fetch when searching
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      debouncedSearchQuery,
      statusFilter
    );
  }, [debouncedSearchQuery]);

  // Auto fetch when filtering
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      searchRef.current,
      statusFilter
    );
  }, [statusFilter]);

  // ======================================================
  // EVENT HANDLERS
  // ======================================================
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

  // Update expected date
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });

      toast.success("Expected date updated!");
      handleRefresh();
      setSelectedRequest(null);
    } catch {
      toast.warning("Error: invalid date");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmAndPrepare = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.CONFIRM_PREPARE, { params: { orderId } });
      toast.success("Confirmed & moved to Preparing!");
      handleRefresh();
      setSelectedRequest(null);
    } catch {
      toast.error("Unable to confirm");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelivered = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.DELIVERED_CLICK, { params: { orderId } });
      toast.success("Marked as delivered!");
      handleRefresh();
      setSelectedRequest(null);
    } catch {
      toast.error("Unable to mark delivered");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Cancel shipment
  const handleCancelShipment = async ({
    orderId,
    reason,
    reasonDetail,
    note,
  }) => {
    if (!orderId || !reason) {
      toast.error("Missing orderId or reason.");
      return;
    }
    setIsActionLoading(true);
    try {
      await request(ApiEnum.CANCEL_SHIPEMENT, {
        params: { orderID: orderId },
        orderId,
        reason,
        reasonDetail: reason === "Other" ? reasonDetail || null : null,
        note: note?.trim() || null,
      });
      toast.success("Shipment cancelled!");
      handleRefresh();
      setSelectedRequest(null);
    } catch (err) {
      toast.error(err?.message || "Cannot cancel shipment");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Resolve discrepancy
  const handleResolveDiscrepancy = async ({
    orderId,
    partResolutions,
    overallNote,
  }) => {
    if (!orderId || !partResolutions) {
      toast.error("Missing data.");
      return;
    }
    setIsActionLoading(true);
    try {
      await request(ApiEnum.RESOLVE_DISCREPANCY, {
        params: { orderID: orderId },
        partResolutions,
        overallNote: overallNote || null,
      });
      toast.success("Discrepancy resolved!");
      handleRefresh();
      setSelectedRequest(null);
    } catch (err) {
      toast.error(err?.message || "Cannot resolve discrepancy");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Detail fetching for special statuses
  const SPECIAL_STATUSES = ["Cancelled", "Return", "Discrepancy"];

  const handleViewDetail = async (order) => {
    try {
      setIsActionLoading(true);
      const { status, orderId } = order;

      let detail = order;

      if (SPECIAL_STATUSES.includes(status)) {
        const res = await request(ApiEnum.GET_PART_ORDER_BY_ID, {
          params: { orderID: orderId },
        });
        if (res?.success) detail = res.data;
      }

      setSelectedRequest(detail);
    } catch {
      toast.error("Unable to load details");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ======================================================
  // FETCH STATUS OPTIONS
  // ======================================================
  const fetchPartOrderStatuses = useCallback(async () => {
    if (loadingStatuses || statusOptions.length) return;

    setLoadingStatuses(true);
    setStatusesError("");

    try {
      const res = await request(ApiEnum.PART_ORDER_STATUSES);
      const raw = res?.data || res || [];

      const list = (Array.isArray(raw) ? raw : [])
        .map((s) =>
          typeof s === "string"
            ? s
            : s?.status || s?.value || s?.name || s?.code
        )
        .filter(Boolean)
        .map((s) => s.trim());

      const unique = [...new Set(list)];

      const displayList = unique
        .map((s) => ({
          value: s,
          label: s,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setStatusOptions(displayList);
    } catch {
      setStatusesError("Cannot load statuses.");
    } finally {
      setLoadingStatuses(false);
    }
  }, [loadingStatuses, statusOptions.length]);

  useEffect(() => {
    fetchPartOrderStatuses();
  }, [fetchPartOrderStatuses]);

  // ======================================================
  // FETCH CANCEL REASONS
  // ======================================================
  const fetchReasonOptions = useCallback(async () => {
    if (loadingReasons || reasonOptions.length > 0) return;

    setLoadingReasons(true);
    setReasonError("");

    try {
      const res = await request(ApiEnum.GET_CANCEL);
      const raw = res?.data || res || [];

      const arr = (Array.isArray(raw) ? raw : [])
        .map((r) => {
          if (typeof r === "string") return { value: r, label: r };
          return {
            value: r.code || r.value || r.id || r.reason || r.name,
            label:
              r.label ||
              r.name ||
              r.title ||
              r.displayName ||
              r.description ||
              r.reason ||
              r.value ||
              r.code,
          };
        })
        .filter((x) => x.value);

      setReasonOptions(arr);
    } catch {
      setReasonError("Cannot load reasons.");
    } finally {
      setLoadingReasons(false);
    }
  }, [loadingReasons, reasonOptions.length]);

  const fetchDiscrepancyOptions = useCallback(async () => {
    if (loadingDiscrepancyOptions || discrepancyOptions) return;

    setLoadingDiscrepancyOptions(true);
    setDiscrepancyOptionError("");

    try {
      const res = await request(ApiEnum.RESOLVE_DISCREPANCY_OPTIONS);

      const data = res?.data || res;

      setDiscrepancyOptions({
        discrepancyTypes: data.discrepancyTypes || [],
        responsibleParties: data.responsibleParties || [],
        damagedPartActions: data.damagedPartActions || [],
        excessPartActions: data.excessPartActions || [],
        shortagePartActions: data.shortagePartActions || [],
      });
    } catch {
      setDiscrepancyOptionError("Cannot load discrepancy options.");
    } finally {
      setLoadingDiscrepancyOptions(false);
    }
  }, [loadingDiscrepancyOptions, discrepancyOptions]);

  useEffect(() => {
    if (selectedRequest?.status === "Discrepancy Review") {
      fetchDiscrepancyOptions();
    }
  }, [selectedRequest, fetchDiscrepancyOptions]);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <>
      <PartList
        data={partsRequests}
        loading={loading}
        error={error}
        onView={handleViewDetail}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusOptions={statusOptions}
        loadingStatuses={loadingStatuses}
        statusesError={statusesError}
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

      {selectedRequest?.status === "In Transit" && (
        <InTransit
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCancelShipment={handleCancelShipment}
          isLoading={isActionLoading}
          reasonOptions={reasonOptions}
          loadingReasons={loadingReasons}
          reasonError={reasonError}
          onLoadReasons={fetchReasonOptions}
        />
      )}

      {selectedRequest?.status === "Discrepancy Review" && (
        <Discrepancy
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReport={handleResolveDiscrepancy}
          isLoading={isActionLoading}
          resolutionOptions={discrepancyOptions}
          loadingOptions={loadingDiscrepancyOptions}
          optionError={discrepancyOptionError}
        />
      )}

      {selectedRequest?.status === "Cancelled" && (
        <Cancelled
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          isLoading={isActionLoading}
        />
      )}
    </>
  );
};

export default PartContainer;
