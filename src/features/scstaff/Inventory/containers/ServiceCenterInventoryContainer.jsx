import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import ServiceCenterInventory from "../components/ServiceCenterInventory";
import { CreatePartsRequestModal } from "../components/CreatePartsRequestModal";
import "../components/ServiceCenterInventory.css";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

export const ServiceCenterInventoryContainer = () => {
  // ===== STATE: INVENTORY =====
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  // Pagination state (harmonized with ManufacturerInventory)
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const [clientPagination, setClientPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
  });
  const latestRequestRef = useRef(0);
  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const statusFilterRef = useRef("");

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // ===== STATE: SEARCH & FILTER =====
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    searchRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  // ===== STATE: CREATE REQUEST =====
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const pendingAddedPartsRef = useRef(null);

  // ========== 0️⃣ FETCH CATEGORIES (once on mount) ==========
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await request(ApiEnum.GET_PART_CATEGORIES);
      console.log("Categories Response:", res);

      const cats = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : [];

      setCategories(cats);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ========== 1️⃣ LOAD INVENTORY ==========
  const fetchInventory = useCallback(async (pageNumber = 0, size, search, status) => {
    const effectiveSize =
      typeof size === "number" && size > 0
        ? size
        : paginationRef.current.pageSize;
    const effectivePage =
      typeof pageNumber === "number" && pageNumber >= 0
        ? pageNumber
        : paginationRef.current.pageNumber;
    const effectiveSearch =
      typeof search === "string" ? search : searchRef.current;
    const effectiveStatus =
      typeof status === "string" ? status : statusFilterRef.current;

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const params = {
        Page: effectivePage,
        Size: effectiveSize,
      };

      // Thêm search query nếu có
      if (effectiveSearch && effectiveSearch.trim()) {
        params.Search = effectiveSearch.trim();
      }

      // Thêm status filter nếu có
      if (effectiveStatus && effectiveStatus.trim()) {
        params.Status = effectiveStatus.trim();
      }

      const response = await request(ApiEnum.GET_PART, params);

      const {
        success,
        items: rawItems,
        totalRecords,
        page,
        size: pageSize,
        message,
      } = normalizePagedResult(response, []);

      if (requestId !== latestRequestRef.current) {
        return;
      }

      if (success) {
        const normalized = rawItems.map((p, index) => ({
          id: p.id ?? p.partId ?? `${p.model ?? "part"}-${index}`,
          model: p.model ?? p.name ?? "",
          category: p.category ?? p.categoryName ?? "",
          status: p.status ?? p.inventoryStatus ?? "",
          stockQuantity: p.stockQuantity ?? p.stockQty ?? 0,
          _raw: p,
        }));

        setItems(normalized);
        setFilteredItems(normalized);
        setPagination({
          pageNumber:
            typeof page === "number" && page >= 0 ? page : effectivePage,
          pageSize:
            typeof pageSize === "number" && pageSize > 0
              ? pageSize
              : effectiveSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : normalized.length,
        });
      } else {
        setItems([]);
        setFilteredItems([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: effectivePage,
          pageSize: effectiveSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load inventory.");
      }
    } catch (err) {
      console.error("Lỗi khi tải inventory:", err);
      if (requestId === latestRequestRef.current) {
        const message =
          err?.responseData?.message ||
          err?.message ||
          "Unable to load inventory.";
        setItems([]);
        setFilteredItems([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: effectivePage,
          pageSize: effectiveSize,
          totalRecords: 0,
        }));
        setError(message);
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchInventory(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchQuery,
      statusFilter
    );
  }, [fetchInventory]);

  // ========== 2️⃣ SEARCH + FILTER (Combined) ==========
  const handleSearch = useCallback((query) => {
    setSearchQuery(query || "");
  }, []);

  const handleFilter = useCallback((category) => {
    setSelectedCategory(category || "");
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
    // Reset về trang đầu khi search
    fetchInventory(0, paginationRef.current.pageSize, value, statusFilterRef.current);
  }, [fetchInventory]);

  const handleStatusFilterChange = useCallback((e) => {
    const value = e.target.value || "";
    setStatusFilter(value);
    // Reset về trang đầu khi đổi status
    fetchInventory(0, paginationRef.current.pageSize, searchRef.current, value);
  }, [fetchInventory]);

  // ========== 3️⃣ CREATE REQUEST ==========
  // Fetch all part models for dropdown (called initially)
  const fetchPartModelsForDropdown = useCallback(async () => {
    setLoadingModels(true);
    try {
      const response = await request(ApiEnum.GET_PART);
      console.log("Part Models Response:", response);

      const partList = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const formatted = partList.map((part) => ({
        value: part.model || "",
        label: `${part.model || "Unknown"} - ${part.name || "No name"}`,
      }));

      console.log("Formatted dropdown models:", formatted);
      setAvailableModels(formatted);
    } catch (err) {
      console.error("Error fetching part models:", err);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Fetch models by selected category
  const fetchModelsByCategory = useCallback(async (category) => {
    if (!category) {
      setAvailableModels([]);
      return [];
    }

    setLoadingModels(true);
    try {
      // Use GET_PART_MODEL endpoint with category query param

      const res = await request(ApiEnum.GET_PART_MODELS, {
        category: category,
      });
      console.log("Models by category response:", res);

      // Normalize response - could be direct array or nested in data
      const partList = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : [];

      const formatted = partList.map((part) => ({
        value: part || "",
        label: `${part}`,
      }));

      setAvailableModels(formatted);
      return formatted;
    } catch (err) {
      console.error("❌ Error fetching models by category:", err);
      setAvailableModels([]);
      return [];
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const handleCreateRequestSubmit = (addedParts) => {
    // Open confirm first
    pendingAddedPartsRef.current = addedParts;
    const count = Array.isArray(addedParts) ? addedParts.length : 0;
    setConfirmTitle("Confirm Parts Request");
    setConfirmMessage(`Submit ${count} part${count === 1 ? "" : "s"} request?`);
    setIsConfirmOpen(true);
  };

  const performCreateRequest = async () => {
    const addedParts = pendingAddedPartsRef.current || [];
    setIsSubmittingCreate(true);
    try {
      for (const p of addedParts) {
        const payload = {
          model: p.model,
          orderId: null,
          quantity: p.quantity,
          remarks: "",
        };
        const response = await request(ApiEnum.SUBMIT_PART_REQUEST, payload);
        if (!response?.success) {
          throw new Error(response?.message || "Failed to create part request");
        }
      }
      toast.success("Parts request created successfully!");
      setShowCreateModal(false);
    } catch (err) {
      console.error("❌ Error creating parts request:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "An error occurred while creating the request.";
      toast.error(msg);
    } finally {
      setIsSubmittingCreate(false);
      setIsConfirmOpen(false);
      pendingAddedPartsRef.current = null;
    }
  };
  const handleRequestPart = (part) => {
    setSelectedPart(part);
    setShowCreateModal(true);
  };

  // Pagination handler
  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      const nextSize =
        typeof newPageSize === "number" && newPageSize > 0
          ? newPageSize
          : paginationRef.current.pageSize;

      const nextPage = Math.max(
        0,
        typeof pageIndex === "number"
          ? pageIndex
          : paginationRef.current.pageNumber
      );

      fetchInventory(nextPage, nextSize, searchRef.current, statusFilterRef.current);
    },
    [fetchInventory]
  );

  const handleRefresh = useCallback(() => {
    fetchInventory(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      statusFilterRef.current
    );
  }, [fetchInventory]);

  // ========== 5️⃣ RENDER ==========
  return (
    <div>
      {/* Nút tạo mới thủ công */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      />

      {/* Bảng Inventory */}
      <ServiceCenterInventory
        data={items}
        categories={categories}
        loading={loading}
        error={error}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRequest={handleRequestPart}
        serverSide={true}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Modal tạo request */}
      <CreatePartsRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRequestSubmit}
        fetchAllPartModels={fetchPartModelsForDropdown}
        fetchPartModelsByCategory={fetchModelsByCategory}
        isLoadingModels={loadingModels}
        availableModels={availableModels}
        categories={categories}
        isSubmitting={isSubmittingCreate}
        preselectedCategory={selectedPart?.category || ""}
        preselectedModel={selectedPart?.model || ""}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={performCreateRequest}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isSubmittingCreate}
      />
    </div>
  );
};

export default ServiceCenterInventoryContainer;
