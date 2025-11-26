// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   request,
//   uploadFiles,
//   ApiEnum,
// } from "../../../../services/NetworkUntil";
// import { normalizePagedResult } from "../../../../services/helpers";
// import { toast } from "react-toastify";

// // Components
// import PartsListEVM from "../components/PartsListEVM";
// import Pending from "../components/Pending";
// import Waiting from "../components/Waiting";
// import Confirmed from "../components/Confirmed";
// import Delivered from "../components/Delivered";
// import InTransit from "../components/InTransit";
// import AddPartOrder from "../components/AddPartOrder";
// import Cancelled from "../components/Cancelled";

// export const EVMPartsListContainer = () => {
//   // ============================================================
//   // 1) STATE
//   // ============================================================
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

//   const [showAddPartOrder, setShowAddPartOrder] = useState(false);

//   // Categories
//   const [categories, setCategories] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(false);

//   // Models
//   const [modelsByCategory, setModelsByCategory] = useState({});
//   const [loadingCategoryModels, setLoadingCategoryModels] = useState({});
//   const [modelsError, setModelsError] = useState("");

//   // Reasons (In Transit Incident)
//   const [reasonOptions, setReasonOptions] = useState([]);
//   const [loadingReasons, setLoadingReasons] = useState(false);
//   const [reasonError, setReasonError] = useState("");
//   // Status options (from API)
//   const [statusOptions, setStatusOptions] = useState([]);
//   const [loadingStatuses, setLoadingStatuses] = useState(false);
//   const [statusesError, setStatusesError] = useState("");

//   // Centers (Organization)
//   const [centers, setCenters] = useState([]);
//   const [loadingCenters, setLoadingCenters] = useState(false);
//   const [centersError, setCentersError] = useState("");

//   // Refs
//   const paginationRef = useRef(pagination);
//   const searchRef = useRef("");
//   const statusRef = useRef("");

//   // ============================================================
//   // 2) Sync Refs
//   // ============================================================
//   useEffect(() => {
//     paginationRef.current = pagination;
//   }, [pagination]);
//   useEffect(() => {
//     searchRef.current = debouncedSearchQuery;
//   }, [debouncedSearchQuery]);
//   useEffect(() => {
//     statusRef.current = statusFilter;
//   }, [statusFilter]);

//   // ============================================================
//   // 3) Debounce Search
//   // ============================================================
//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // ============================================================
//   // 4) Fetch Main List
//   // ============================================================
//   const fetchPartsRequests = useCallback(
//     async (pageNumber = 0, pageSize, search, status) => {
//       const effectivePageSize =
//         pageSize > 0 ? pageSize : paginationRef.current.pageSize;

//       const effectiveSearch =
//         typeof search === "string" ? search : searchRef.current;
//       const effectiveStatus =
//         typeof status === "string" ? status : statusRef.current;

//       setLoading(true);
//       setError(null);
//       try {
//         const params = { Page: pageNumber, Size: effectivePageSize };
//         if (effectiveSearch?.trim()) params.Search = effectiveSearch.trim();
//         if (effectiveStatus?.trim()) params.Status = effectiveStatus;

//         const res = await request(ApiEnum.GET_REQUEST_PARTS, params);
//         const { success, items, totalRecords, page, size, message } =
//           normalizePagedResult(res, []);

//         let resultItems = items || [];

//         if (!success) {
//           setPartsRequests([]);
//           setPagination({
//             pageNumber,
//             pageSize: effectivePageSize,
//             totalRecords: 0,
//           });
//           setError(message || "Unable to load parts requests");
//           return;
//         }

//         setPartsRequests(resultItems);
//         setPagination({
//           pageNumber: typeof page === "number" ? page : pageNumber,
//           pageSize: size || effectivePageSize,
//           totalRecords: totalRecords ?? resultItems.length,
//         });
//       } catch (err) {
//         setPartsRequests([]);
//         setError(err?.message);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   // Refetch when search changes
//   useEffect(() => {
//     setPagination((p) => ({ ...p, pageNumber: 0 }));
//     fetchPartsRequests(
//       0,
//       paginationRef.current.pageSize,
//       debouncedSearchQuery,
//       statusFilter
//     );
//   }, [debouncedSearchQuery]);

//   // Refetch when status changes
//   useEffect(() => {
//     setPagination((p) => ({ ...p, pageNumber: 0 }));
//     fetchPartsRequests(
//       0,
//       paginationRef.current.pageSize,
//       searchRef.current,
//       statusFilter
//     );
//   }, [statusFilter]);

//   // ============================================================
//   // 5) Handlers
//   // ============================================================
//   const handleSearchChange = (e) => setSearchQuery(e.target.value || "");
//   const handleStatusFilterChange = (e) => setStatusFilter(e.target.value || "");

//   const handlePageChange = useCallback(
//     (page, size) => fetchPartsRequests(page, size),
//     [fetchPartsRequests]
//   );

//   const handleRefresh = useCallback(
//     () =>
//       fetchPartsRequests(
//         paginationRef.current.pageNumber,
//         paginationRef.current.pageSize
//       ),
//     [fetchPartsRequests]
//   );

//   const handleAddPartOrder = () => setShowAddPartOrder(true);

//   // ------------------------------------------------------------
//   // Incident report
//   // ------------------------------------------------------------
//   const handleReportIncident = async ({ orderId, reason, notes }) => {
//     try {
//       setIsActionLoading(true);
//       toast.success("Incident reported (stub)");
//       handleRefresh();
//       setSelectedRequest(null);
//     } catch {
//       toast.error("Unable to report incident");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ------------------------------------------------------------
//   // Update date
//   // ------------------------------------------------------------
//   const handleSetRequestedDate = async (orderId, requestedDate) => {
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.UPDATE_REQUESTED_DATE, {
//         params: { orderId },
//         expectedDate: requestedDate,
//       });
//       handleRefresh();
//       setSelectedRequest(null);
//       toast.success("Expected date updated!");
//     } catch {
//       toast.warning("Error updating date");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ------------------------------------------------------------
//   // Confirm & Prepare
//   // ------------------------------------------------------------
//   const handleConfirmAndPrepare = async (orderId) => {
//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.CONFIRM_PREPARE, { params: { orderId } });
//       handleRefresh();
//       setSelectedRequest(null);
//       toast.success("Request confirmed!");
//     } catch {
//       toast.error("Unable to confirm request");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // === VALIDATE SHIPMENT (UPLOAD EXCEL) ===
//   const handleValidateShipment = async (orderId, file) => {
//     setIsActionLoading(true);
//     try {
//       // Gọi API Validate (Dùng API mới trong NetworkUntil.js)
//       const response = await uploadFiles(ApiEnum.VALIDATE_SHIPMENT, {
//         params: { orderId },
//         file: file,
//       });
//       return response;
//     } catch (error) {
//       console.error(error);
//       const msg = error.responseData?.message || "Error validating file";
//       return { success: false, message: msg };
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // === CONFIRM SHIPMENT (GỬI HÀNG) ===
//   const handleConfirmShipment = async (orderId) => {
//     setIsActionLoading(true);
//     try {
//       // Gọi API Confirm Shipment để chuyển trạng thái sang In Transit
//       await request(ApiEnum.CONFIRM_SHIPMENT, { params: { orderId } }, "PUT");

//       handleRefresh();
//       setSelectedRequest(null);
//       toast.success("Shipment confirmed! Status: In Transit.");
//     } catch {
//       toast.error("Error confirming shipment");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ------------------------------------------------------------
//   // Create new Part Order (manual via modal)
//   const handleAddPartOrderSubmit = async ({ receiver, items }) => {
//     if (!receiver || !Array.isArray(items) || !items.length) {
//       toast.error("Missing required data.");
//       return;
//     }
//     setIsActionLoading(true);
//     try {
//       const payload = {
//         serviceCenterId: receiver,
//         items: items.map((it) => ({
//           model: it.model,
//           quantity: it.quantity,
//           remarks: null,
//         })),
//       };

//       // Prefer ADD_PART_ORDER if exists; fallback to CREATE_PART_ORDER_BY_EVM
//       await request(
//         ApiEnum.ADD_PART_ORDER || ApiEnum.CREATE_PART_ORDER_BY_EVM,
//         payload
//       );
//       toast.success("Part order created successfully!");
//       handleRefresh();
//       setShowAddPartOrder(false);
//     } catch (err) {
//       console.error("AddPartOrder error:", err);
//       toast.error(
//         err?.responseData?.message ||
//           err?.message ||
//           "Failed to create part order"
//       );
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   // ============================================================
//   // 6) FETCH CATEGORIES
//   // ============================================================
//   const fetchCategories = useCallback(async () => {
//     if (categories.length) return;
//     setLoadingCategories(true);

//     try {
//       const res = await request(ApiEnum.GET_PART_CATEGORIES);
//       const list = Array.isArray(res?.data || res || []) ? res.data || res : [];
//       setCategories(list.filter((c) => typeof c === "string" && c));
//     } catch {
//       setCategories([]);
//     } finally {
//       setLoadingCategories(false);
//     }
//   }, [categories.length]);

//   // Fetch categories only when modal opens
//   useEffect(() => {
//     if (showAddPartOrder) fetchCategories();
//   }, [showAddPartOrder, fetchCategories]);

//   // ============================================================
//   // 7) FETCH MODELS BY CATEGORY
//   // ============================================================
//   const fetchModelsByCategory = useCallback(
//     async (category) => {
//       if (!category) return [];
//       if (modelsByCategory[category]) return modelsByCategory[category];

//       setLoadingCategoryModels((prev) => ({ ...prev, [category]: true }));
//       setModelsError("");

//       try {
//         const res = await request(ApiEnum.GET_PART_MODELS, { category });
//         const arr = (
//           Array.isArray(res?.data || res || []) ? res.data || res : []
//         )
//           .map((m) => {
//             if (typeof m === "string") return { value: m, label: m };
//             const value = m.code || m.model || m.name || m.id || m.value;
//             const label = m.label || m.name || m.model || m.code || value;
//             return value ? { value, label } : null;
//           })
//           .filter(Boolean);

//         setModelsByCategory((prev) => ({ ...prev, [category]: arr }));
//         return arr;
//       } catch {
//         setModelsError("cannot load models for selected category.");
//         setModelsByCategory((prev) => ({ ...prev, [category]: [] }));
//         return [];
//       } finally {
//         setLoadingCategoryModels((prev) => ({ ...prev, [category]: false }));
//       }
//     },
//     [modelsByCategory]
//   );

//   // ============================================================
//   // 8) FETCH REASONS (In Transit)
//   // ============================================================
//   const fetchReasonOptions = useCallback(async () => {
//     setLoadingReasons(true);
//     setReasonError("");

//     try {
//       const res = await request(ApiEnum.GET_REASON);
//       const arr = (Array.isArray(res?.data || res || []) ? res.data || res : [])
//         .map((r) => ({
//           value: r.code || r.value || r.id,
//           label: r.label || r.name || r.description || r.reason,
//         }))
//         .filter((x) => x.value);

//       setReasonOptions(arr);
//     } catch {
//       setReasonError("cannot load reason options.");
//     } finally {
//       setLoadingReasons(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedRequest?.status === "In Transit") {
//       fetchReasonOptions();
//     }
//   }, [selectedRequest, fetchReasonOptions]);

//   // ============================================================
//   // FETCH PART ORDER STATUSES (once)
//   // ============================================================
//   const fetchPartOrderStatuses = useCallback(async () => {
//     if (loadingStatuses || statusOptions.length) return; // avoid refetch
//     setLoadingStatuses(true);
//     setStatusesError("");
//     try {
//       const res = await request(ApiEnum.PART_ORDER_STATUSES);
//       const raw = res?.data || res || [];

//       const displayMapping = {
//         // Preserve raw value for filtering, only change label shown to user
//         "Return Inspection": "Return Inspection",
//       };
//       const collected = (Array.isArray(raw) ? raw : [])
//         .map((s) =>
//           typeof s === "string"
//             ? s
//             : s?.status || s?.value || s?.name || s?.code || null
//         )
//         .filter(Boolean)
//         .map((s) => s.trim());

//       const uniqueRaw = collected.filter(
//         (s, idx, arr) => arr.indexOf(s) === idx
//       );

//       const list = uniqueRaw
//         .map((rawStatus) => ({
//           value: rawStatus, // raw value sent to backend
//           label: displayMapping[rawStatus] || rawStatus, // corrected label if needed
//         }))
//         .sort((a, b) => a.label.localeCompare(b.label));

//       setStatusOptions(list);
//     } catch (err) {
//       console.error("Load statuses failed:", err);
//       setStatusesError("Cannot load statuses.");
//     } finally {
//       setLoadingStatuses(false);
//     }
//   }, [loadingStatuses, statusOptions.length]);

//   useEffect(() => {
//     fetchPartOrderStatuses();
//   }, [fetchPartOrderStatuses]);

//   // ============================================================
//   // 9) FETCH ORGANIZATION (Centers)
//   // ============================================================
//   const fetchCenters = useCallback(async () => {
//     setLoadingCenters(true);
//     setCentersError("");

//     try {
//       const res = await request(ApiEnum.ORGANIZATION);

//       let arr = Array.isArray(res?.data || res || []) ? res.data || res : [];

//       arr = arr
//         .map((o) => {
//           const value = o.id || o.code || o.orgId || o.value || o.name;
//           const label = o.name || o.label || o.description || value;
//           return value ? { value, label } : null;
//         })
//         .filter(Boolean);

//       setCenters(arr);
//     } catch (err) {
//       console.error("Load centers failed:", err);
//       setCenters([]);
//       setCentersError("cannot load service center options.");
//     } finally {
//       setLoadingCenters(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (showAddPartOrder) fetchCenters();
//   }, [showAddPartOrder, fetchCenters]);

//   // ------------------------------------------------------------
//   // RETURN SHIPMENT
//   // ------------------------------------------------------------
//   const handleReturnShipment = async ({
//     orderId,
//     reason,
//     reasonDetail,
//     note,
//   }) => {
//     if (!orderId || !reason) {
//       toast.error("Missing required fields: orderId, reason");
//       return;
//     }

//     setIsActionLoading(true);
//     try {
//       await request(ApiEnum.RETURN_SHIPMENT, {
//         // replace :orderID in path
//         params: { orderID: orderId },
//         orderId: orderId,
//         reason: reason,
//         reasonDetail: reasonDetail || null,
//         note: note || null,
//       });
//       toast.success("Return shipment reported successfully!");
//       handleRefresh();
//       setSelectedRequest(null);
//     } catch (err) {
//       console.error("Return shipment error:", err);
//       toast.error(
//         err?.responseData?.message ||
//           err?.message ||
//           "Failed to report return shipment"
//       );
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

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

//   // ============================================================
//   // 10) RENDER
//   // ============================================================

//   return (
//     <>
//       <PartsListEVM
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
//         statusOptions={statusOptions}
//         onAdd={handleAddPartOrder}
//         isActionLoading={isActionLoading}
//       />

//       {/* ADD PART ORDER */}
//       <AddPartOrder
//         isOpen={showAddPartOrder}
//         onClose={() => setShowAddPartOrder(false)}
//         onSubmit={handleAddPartOrderSubmit}
//         centers={centers}
//         loadingCenters={loadingCenters}
//         centersError={centersError}
//         categories={categories}
//         loadingCategories={loadingCategories}
//         modelsByCategory={modelsByCategory}
//         loadingCategoryModels={loadingCategoryModels}
//         onFetchModelsByCategory={fetchModelsByCategory}
//       />

//       {/* STATUS MODALS */}
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

//       {/* MODAL CONFIRMED (Đã update logic validate & ship) */}
//       {selectedRequest?.status === "Confirmed" && (
//         <Confirmed
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onValidate={handleValidateShipment}
//           onDelivered={handleConfirmShipment} // Gọi hàm Ship
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "Delivered" && (
//         <Delivered
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           isLoading={isActionLoading}
//         />
//       )}

//       {selectedRequest?.status === "In Transit" && (
//         <InTransit
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onReport={handleReportIncident}
//           isLoading={isActionLoading}
//           reasonOptions={reasonOptions}
//           loadingReasons={loadingReasons}
//           reasonError={reasonError}
//           onLoadReasons={fetchReasonOptions}
//           onReturnShipment={handleReturnShipment}
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

// export default EVMPartsListContainer;

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  request,
  uploadFiles,
  ApiEnum,
} from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import { toast } from "react-toastify";

// Components
import PartsListEVM from "../components/PartsListEVM";
import Pending from "../components/Pending";
import Waiting from "../components/Waiting";
import Confirmed from "../components/Confirmed";
import Delivered from "../components/Delivered";
import InTransit from "../components/InTransit";
import AddPartOrder from "../components/AddPartOrder";
import Cancelled from "../components/Cancelled";
import Returning from "../components/Returning";
import ReturnInspection from "../components/ReturnInspection";

export const EVMPartsListContainer = () => {
  // ============================================================
  // 1) STATE
  // ============================================================
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

  const [showAddPartOrder, setShowAddPartOrder] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Models
  const [modelsByCategory, setModelsByCategory] = useState({});
  const [loadingCategoryModels, setLoadingCategoryModels] = useState({});
  const [modelsError, setModelsError] = useState("");

  // Reasons (In Transit Incident)
  const [reasonOptions, setReasonOptions] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [reasonError, setReasonError] = useState("");
  // Status options (from API)
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [statusesError, setStatusesError] = useState("");

  // Centers (Organization)
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [centersError, setCentersError] = useState("");

  // Refs
  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const statusRef = useRef("");

  // ============================================================
  // 2) Sync Refs
  // ============================================================
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);
  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);
  useEffect(() => {
    statusRef.current = statusFilter;
  }, [statusFilter]);

  // ============================================================
  // 3) Debounce Search
  // ============================================================
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ============================================================
  // 4) Fetch Main List
  // ============================================================
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

        let resultItems = items || [];

        if (!success) {
          setPartsRequests([]);
          setPagination({
            pageNumber,
            pageSize: effectivePageSize,
            totalRecords: 0,
          });
          setError(message || "Unable to load parts requests");
          return;
        }

        setPartsRequests(resultItems);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize: size || effectivePageSize,
          totalRecords: totalRecords ?? resultItems.length,
        });
      } catch (err) {
        setPartsRequests([]);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Refetch when search changes
  useEffect(() => {
    setPagination((p) => ({ ...p, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      debouncedSearchQuery,
      statusFilter
    );
  }, [debouncedSearchQuery]);

  // Refetch when status changes
  useEffect(() => {
    setPagination((p) => ({ ...p, pageNumber: 0 }));
    fetchPartsRequests(
      0,
      paginationRef.current.pageSize,
      searchRef.current,
      statusFilter
    );
  }, [statusFilter]);

  // ============================================================
  // 5) Handlers
  // ============================================================
  const handleSearchChange = (e) => setSearchQuery(e.target.value || "");
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value || "");

  const handlePageChange = useCallback(
    (page, size) => fetchPartsRequests(page, size),
    [fetchPartsRequests]
  );

  const handleRefresh = useCallback(
    () =>
      fetchPartsRequests(
        paginationRef.current.pageNumber,
        paginationRef.current.pageSize
      ),
    [fetchPartsRequests]
  );

  const handleAddPartOrder = () => setShowAddPartOrder(true);

  // ------------------------------------------------------------
  // Incident report
  // ------------------------------------------------------------
  const handleReportIncident = async ({ orderId, reason, notes }) => {
    try {
      setIsActionLoading(true);
      toast.success("Incident reported (stub)");
      handleRefresh();
      setSelectedRequest(null);
    } catch {
      toast.error("Unable to report incident");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Update date
  // ------------------------------------------------------------
  const handleSetRequestedDate = async (orderId, requestedDate) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.UPDATE_REQUESTED_DATE, {
        params: { orderId },
        expectedDate: requestedDate,
      });
      handleRefresh();
      setSelectedRequest(null);
      toast.success("Expected date updated!");
    } catch {
      toast.warning("Error updating date");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Confirm & Prepare
  // ------------------------------------------------------------
  const handleConfirmAndPrepare = async (orderId) => {
    setIsActionLoading(true);
    try {
      await request(ApiEnum.CONFIRM_PREPARE, { params: { orderId } });
      handleRefresh();
      setSelectedRequest(null);
      toast.success("Request confirmed!");
    } catch {
      toast.error("Unable to confirm request");
    } finally {
      setIsActionLoading(false);
    }
  };

  // === VALIDATE SHIPMENT (UPLOAD EXCEL) - SỬA LẠI ĐỂ TRẢ VỀ DATA LỖI ===
  const handleValidateShipment = async (orderId, file) => {
    setIsActionLoading(true);
    try {
      // Gọi API Validate
      const response = await uploadFiles(ApiEnum.VALIDATE_SHIPMENT, {
        params: { orderId },
        file: file,
      });
      return response;
    } catch (error) {
      console.error("Validate error:", error);

      // [UPDATE] Nếu Server trả về object lỗi chi tiết (có data), hãy return nó
      // để UI có thể hiển thị bảng Discrepancy
      if (error.responseData) {
        return error.responseData;
      }

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

  // ------------------------------------------------------------
  // Create new Part Order (manual via modal)
  const handleAddPartOrderSubmit = async ({ receiver, items }) => {
    if (!receiver || !Array.isArray(items) || !items.length) {
      toast.error("Missing required data.");
      return;
    }
    setIsActionLoading(true);
    try {
      const payload = {
        serviceCenterId: receiver,
        items: items.map((it) => ({
          model: it.model,
          quantity: it.quantity,
          remarks: null,
        })),
      };

      await request(
        ApiEnum.ADD_PART_ORDER || ApiEnum.CREATE_PART_ORDER_BY_EVM,
        payload
      );
      toast.success("Part order created successfully!");
      handleRefresh();
      setShowAddPartOrder(false);
    } catch (err) {
      console.error("AddPartOrder error:", err);
      toast.error(
        err?.responseData?.message ||
          err?.message ||
          "Failed to create part order"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // ============================================================
  // 6) FETCH CATEGORIES
  // ============================================================
  const fetchCategories = useCallback(async () => {
    if (categories.length) return;
    setLoadingCategories(true);

    try {
      const res = await request(ApiEnum.GET_PART_CATEGORIES);
      const list = Array.isArray(res?.data || res || []) ? res.data || res : [];
      setCategories(list.filter((c) => typeof c === "string" && c));
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [categories.length]);

  useEffect(() => {
    if (showAddPartOrder) fetchCategories();
  }, [showAddPartOrder, fetchCategories]);

  // ============================================================
  // 7) FETCH MODELS BY CATEGORY
  // ============================================================
  const fetchModelsByCategory = useCallback(
    async (category) => {
      if (!category) return [];
      if (modelsByCategory[category]) return modelsByCategory[category];

      setLoadingCategoryModels((prev) => ({ ...prev, [category]: true }));
      setModelsError("");

      try {
        const res = await request(ApiEnum.GET_PART_MODELS, { category });
        const arr = (
          Array.isArray(res?.data || res || []) ? res.data || res : []
        )
          .map((m) => {
            if (typeof m === "string") return { value: m, label: m };
            const value = m.code || m.model || m.name || m.id || m.value;
            const label = m.label || m.name || m.model || m.code || value;
            return value ? { value, label } : null;
          })
          .filter(Boolean);

        setModelsByCategory((prev) => ({ ...prev, [category]: arr }));
        return arr;
      } catch {
        setModelsError("cannot load models for selected category.");
        setModelsByCategory((prev) => ({ ...prev, [category]: [] }));
        return [];
      } finally {
        setLoadingCategoryModels((prev) => ({ ...prev, [category]: false }));
      }
    },
    [modelsByCategory]
  );

  // ============================================================
  // 8) FETCH REASONS (In Transit)
  // ============================================================
  const fetchReasonOptions = useCallback(async () => {
    setLoadingReasons(true);
    setReasonError("");

    try {
      const res = await request(ApiEnum.GET_REASON);
      const arr = (Array.isArray(res?.data || res || []) ? res.data || res : [])
        .map((r) => ({
          value: r.code || r.value || r.id,
          label: r.label || r.name || r.description || r.reason,
        }))
        .filter((x) => x.value);

      setReasonOptions(arr);
    } catch {
      setReasonError("cannot load reason options.");
    } finally {
      setLoadingReasons(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRequest?.status === "In Transit") {
      fetchReasonOptions();
    }
  }, [selectedRequest, fetchReasonOptions]);

  // ============================================================
  // FETCH PART ORDER STATUSES (once)
  // ============================================================
  const fetchPartOrderStatuses = useCallback(async () => {
    if (loadingStatuses || statusOptions.length) return;
    setLoadingStatuses(true);
    setStatusesError("");
    try {
      const res = await request(ApiEnum.PART_ORDER_STATUSES);
      const raw = res?.data || res || [];

      const displayMapping = {
        "Return Inspection": "Return Inspection",
      };
      const collected = (Array.isArray(raw) ? raw : [])
        .map((s) =>
          typeof s === "string"
            ? s
            : s?.status || s?.value || s?.name || s?.code || null
        )
        .filter(Boolean)
        .map((s) => s.trim());

      const uniqueRaw = collected.filter(
        (s, idx, arr) => arr.indexOf(s) === idx
      );

      const list = uniqueRaw
        .map((rawStatus) => ({
          value: rawStatus,
          label: displayMapping[rawStatus] || rawStatus,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setStatusOptions(list);
    } catch (err) {
      console.error("Load statuses failed:", err);
      setStatusesError("Cannot load statuses.");
    } finally {
      setLoadingStatuses(false);
    }
  }, [loadingStatuses, statusOptions.length]);

  useEffect(() => {
    fetchPartOrderStatuses();
  }, [fetchPartOrderStatuses]);

  // ============================================================
  // 9) FETCH ORGANIZATION (Centers)
  // ============================================================
  const fetchCenters = useCallback(async () => {
    setLoadingCenters(true);
    setCentersError("");

    try {
      const res = await request(ApiEnum.ORGANIZATION);

      let arr = Array.isArray(res?.data || res || []) ? res.data || res : [];

      arr = arr
        .map((o) => {
          const value = o.id || o.code || o.orgId || o.value || o.name;
          const label = o.name || o.label || o.description || value;
          return value ? { value, label } : null;
        })
        .filter(Boolean);

      setCenters(arr);
    } catch (err) {
      console.error("Load centers failed:", err);
      setCenters([]);
      setCentersError("cannot load service center options.");
    } finally {
      setLoadingCenters(false);
    }
  }, []);

  useEffect(() => {
    if (showAddPartOrder) fetchCenters();
  }, [showAddPartOrder, fetchCenters]);

  // ------------------------------------------------------------
  // RETURN SHIPMENT
  // ------------------------------------------------------------
  const handleReturnShipment = async ({
    orderId,
    reason,
    reasonDetail,
    note,
  }) => {
    if (!orderId || !reason) {
      toast.error("Missing required fields: orderId, reason");
      return;
    }

    setIsActionLoading(true);
    try {
      await request(ApiEnum.RETURN_SHIPMENT, {
        params: { orderId: orderId },
        orderId: orderId,
        reason: reason,
        reasonDetail: reasonDetail || null,
        note: note || null,
      });
      toast.success("Return shipment reported successfully!");
      handleRefresh();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Return shipment error:", err);
      toast.error(
        err?.responseData?.message ||
          err?.message ||
          "Failed to report return shipment"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const SPECIAL_STATUSES = ["Cancelled", "Return", "Discrepancy"];

  const handleViewDetail = async (order) => {
    try {
      setIsActionLoading(true);

      const { status, orderId } = order;
      let detailData = order;

      if (SPECIAL_STATUSES.includes(status)) {
        const res = await request(ApiEnum.GET_PART_ORDER_BY_ID, {
          params: { orderID: orderId },
        });

        if (res?.success) {
          detailData = res.data;
        }
      }

      setSelectedRequest(detailData);
    } catch (err) {
      console.error("Failed to load order detail", err);
      toast.error("Unable to load order detail");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ============================================================
  // 10) RENDER
  // ============================================================

  return (
    <>
      <PartsListEVM
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
        onAdd={handleAddPartOrder}
        isActionLoading={isActionLoading}
      />

      {/* ADD PART ORDER */}
      <AddPartOrder
        isOpen={showAddPartOrder}
        onClose={() => setShowAddPartOrder(false)}
        onSubmit={handleAddPartOrderSubmit}
        centers={centers}
        loadingCenters={loadingCenters}
        centersError={centersError}
        categories={categories}
        loadingCategories={loadingCategories}
        modelsByCategory={modelsByCategory}
        loadingCategoryModels={loadingCategoryModels}
        onFetchModelsByCategory={fetchModelsByCategory}
      />

      {/* STATUS MODALS */}
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
          onValidate={handleValidateShipment}
          onDelivered={handleConfirmShipment}
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

      {selectedRequest?.status === "In Transit" && (
        <InTransit
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReport={handleReportIncident}
          isLoading={isActionLoading}
          reasonOptions={reasonOptions}
          loadingReasons={loadingReasons}
          reasonError={reasonError}
          onLoadReasons={fetchReasonOptions}
          onReturnShipment={handleReturnShipment}
        />
      )}
      {selectedRequest?.status === "Cancelled" && (
        <Cancelled
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          isLoading={isActionLoading}
        />
      )}

      {selectedRequest?.status === "Returning" && (
        <Returning
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={handleRefresh}
        />
      )}

      {(selectedRequest?.status === "Return Inspection" ||
        selectedRequest?.status === "ReturnInspection") && (
        <ReturnInspection
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
};

export default EVMPartsListContainer;
