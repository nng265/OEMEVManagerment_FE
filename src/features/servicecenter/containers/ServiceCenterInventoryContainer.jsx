import React, { useEffect, useState, useCallback } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import ServiceCenterInventory from "../components/ServiceCenterInventory";
import { CreatePartsRequestModal } from "../components/CreatePartsRequestModal";
import { Button } from "../../../components/atoms/Button/Button";

export const ServiceCenterInventoryContainer = () => {
  // ===== STATE: INVENTORY =====
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  // Pagination state (harmonized with ManufacturerInventory)
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ===== STATE: SEARCH & FILTER =====
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ===== STATE: CREATE REQUEST =====
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // ========== 0️⃣ FETCH CATEGORIES (once on mount) ==========
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await request(ApiEnum.GET_PART_CATEGORY);
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
  const fetchInventory = useCallback(
    async (page = pageNumber) => {
      setLoading(true);
      try {
        // Request with pagination params; API may ignore them if unsupported
        const res = await request(ApiEnum.GET_PART, {
          params: { pageNumber: page, pageSize },
        });
        const result = res?.data ?? [];

        let raw = [];
        // If API returns paginated shape { items: [...], pageNumber, totalPages, totalRecords }
        if (result && Array.isArray(result.items)) {
          raw = result.items;
          setPageNumber(result.pageNumber ?? page);
          setTotalPages(result.totalPages ?? 1);
          setTotalRecords(result.totalRecords ?? raw.length);
        } else if (Array.isArray(result)) {
          raw = result;
          setPageNumber(0);
          setTotalPages(1);
          setTotalRecords(raw.length);
        } else if (Array.isArray(res)) {
          raw = res;
          setPageNumber(0);
          setTotalPages(1);
          setTotalRecords(raw.length);
        }

        const normalized = (raw || []).map((p) => ({
          model: p.model || p.name || "",
          category: p.category || p.categoryName || "",
          status: p.status || p.inventoryStatus || "",
          stockQuantity: p.stockQuantity ?? p.stockQty ?? "",
          _raw: p,
        }));

        setItems(normalized);
        setFilteredItems(normalized);
      } catch (err) {
        console.error("Lỗi khi tải inventory:", err);
      } finally {
        setLoading(false);
      }
    },
    [pageNumber, pageSize]
  );

  useEffect(() => {
    fetchInventory(pageNumber);
  }, [fetchInventory]);

  // ========== 2️⃣ SEARCH + FILTER (Combined) ==========
  // Apply both search and filter together whenever items, query, or category changes
  useEffect(() => {
    let result = [...items];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.model?.toLowerCase().includes(q));
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query || "");
  };

  const handleFilter = (category) => {
    setSelectedCategory(category || "");
  };

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
      const res = await request(ApiEnum.GET_PART_MODEL, {
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

  const handleCreateRequestSubmit = async (addedParts) => {
    setIsSubmittingCreate(true);
    try {
      // ✅ Nếu chỉ gửi từng part riêng (theo API mô tả)
      for (const p of addedParts) {
        const payload = {
          model: p.model,
          orderId: null, // hoặc truyền orderId thật nếu bạn có
          quantity: p.quantity,
          remarks: "", // hoặc ghi chú nếu muốn
        };

        console.log("Submitting PartOrderItem:", payload);
        const response = await request(ApiEnum.SUBMIT_PART_REQUEST, payload);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to create part request");
        }
      }

      alert("✅ Parts request created successfully!");
      setShowCreateModal(false);
    } catch (err) {
      console.error("❌ Error creating parts request:", err);
      alert("An error occurred while creating the request.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };
  const handleRequestPart = (part) => {
    setSelectedPart(part);
    setShowCreateModal(true);
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  // Page size change handler (reset to first page and reload)
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPageNumber(0);
    // reload first page with new size
    fetchInventory(0);
  };

  // ========== 5️⃣ RENDER ==========
  return (
    <div style={{ marginTop: 40 }}>
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
        data={filteredItems}
        categories={categories}
        loading={loading}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRequest={handleRequestPart}
        // pagination props
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
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
    </div>
  );
};

export default ServiceCenterInventoryContainer;
