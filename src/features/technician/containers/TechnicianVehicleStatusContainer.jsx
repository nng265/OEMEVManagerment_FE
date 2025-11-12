import React, { useState, useEffect, useCallback, useRef } from "react";
import { request, uploadFiles, ApiEnum } from "../../../services/NetworkUntil";
import { TechnicianVehicleStatusView } from "../components/TechnicianVehicleStatusView";
import { formatDate, normalizePagedResult } from "../../../services/helpers"; // Assuming you have this helper
import { Button } from "../../../components/atoms"; // Import Button for actions

export const TechnicianVehicleStatusContainer = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // part to replace/repair
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [serials, setSerials] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const targetRef = useRef("");
  const typeRef = useRef("");

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  useEffect(() => {
    targetRef.current = targetFilter;
  }, [targetFilter]);

  useEffect(() => {
    typeRef.current = typeFilter;
  }, [typeFilter]);

  // Debounce search query để tránh request liên tục
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay 500ms sau khi user ngừng gõ

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // --- UPDATED COLUMNS DEFINITION ---
  const columns = [
    {
      key: "vin", // Key for sorting (using nested value)
      label: "VIN", // Changed label
      sortable: true,
      // Render function to access nested data
      render: (_, row) => row?.vin || "-", // Access warrantyClaim.vin
    },
    {
      key: "target", // Key for sorting (using nested value)
      label: "Target", // Changed label to match image
      sortable: true,
      // Render function to access nested data
      render: (_, row) => row.target || "-", // Access warrantyClaim.failureDesc
    },
    {
      key: "type", // Correct top-level key for 'Task'
      label: "Task", // Changed label to match image
      sortable: true,
    },
    {
      key: "status", // Correct top-level key for work order status
      label: "Status", // Changed label to match image
      sortable: true,
      render: (value) => {
        // Keep status badge rendering
        // Adjust class generation if needed based on actual status values
        const statusClass = (value || "unknown")
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/_/g, "-");
        return (
          <span className={`status-badge status-${statusClass}`}>{value}</span>
        );
      },
    },
    {
      key: "startDate", // Correct top-level key for date
      label: "Date", // Changed label to match image
      sortable: true,
      // Format date only (no time)
      render: (value) =>
        formatDate(value, "vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      // Actions column
      key: "actions",
      label: "Actions", // Changed label to match image
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary" // Match 'View Details' button style
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleViewWorkOrderDetail(row); // Function to handle viewing details
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORIES);
      console.log("Category response:", response);
      // normalize possible shapes
      const raw = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      // map to plain string names to match <option value>
      const catNames = raw
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.categoryName || item?.category
        )
        .filter(Boolean);
      setCategories(catNames);
      return catNames;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }, []);

  const fetchWorkOrders = useCallback(async (pageNumber = 0, pageSize, search, target, type) => {
    const effectivePageSize =
      typeof pageSize === "number" ? pageSize : paginationRef.current.pageSize;
    const effectiveSearch =
      typeof search === "string" ? search : searchRef.current;
    const effectiveTarget =
      typeof target === "string" ? target : targetRef.current;
    const effectiveType =
      typeof type === "string" ? type : typeRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        Page: pageNumber,
        Size: effectivePageSize,
      };

      // Thêm search query nếu có
      if (effectiveSearch && effectiveSearch.trim()) {
        params.Search = effectiveSearch.trim();
      }

      // Thêm target filter nếu có
      if (effectiveTarget && effectiveTarget.trim()) {
        params.Target = effectiveTarget.trim();
      }

      // Thêm type filter nếu có
      if (effectiveType && effectiveType.trim()) {
        params.Type = effectiveType.trim();
      }

      const response = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH, params);

      const { success, items, totalRecords, page, size, message } =
        normalizePagedResult(response, []);

      if (success) {
        setWorkOrders(items);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize:
            typeof size === "number" && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } else {
        setWorkOrders([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load work order list.");
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
      const message =
        err?.responseData?.message ||
        err?.message ||
        "An error occurred while loading work order list.";
      setWorkOrders([]);
      setPagination((prev) => ({
        ...prev,
        pageNumber,
        pageSize: effectivePageSize,
        totalRecords: 0,
      }));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchWorkOrders(0, paginationRef.current.pageSize, debouncedSearchQuery, targetFilter, typeFilter);
  }, [fetchWorkOrders, debouncedSearchQuery, targetFilter, typeFilter]);

  // const fetchWorkOrders = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // ✅ Dùng mock data thay vì gọi API
  //     await new Promise((resolve) => setTimeout(resolve, 300)); // giả delay 300ms
  //     console.log("Mock Work Orders:", mockWorkOrders);
  //     setWorkOrders(mockWorkOrders);
  //   } catch (err) {
  //     console.error("Error loading mock work orders:", err);
  //     setError("An error occurred while loading mock data.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Lấy danh sách model theo category
  const fetchModels = async (categoryName) => {
    try {
      if (!categoryName) {
        setModels([]);
        return [];
      }
      const response = await request(ApiEnum.GET_PART_MODELS, {
        category: categoryName,
      });
      console.log("Model response:", response);
      const mods = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setModels(mods);
      return mods; // Return data để modal có thể dùng
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  };

  // Lấy danh sách serial theo vin và model
  const fetchSerial = async (vin, modelName) => {
    try {
      if (!vin || !modelName) {
        setSerials([]);
        return [];
      }

      console.log("fetchSerial called with:", { vin, modelName });

      const response = await request(ApiEnum.GET_PART_SERIAL, {
        vin: vin,
        model: modelName,
      });

      console.log("Serial response:", response);
      const sers = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setSerials(sers);
      return sers; // Return data để modal có thể dùng
    } catch (error) {
      console.error("Error fetching serials:", error);
      setSerials([]);
      return [];
    }
  };

  const fetchCategoryByModel = useCallback(async (modelName) => {
    try {
      if (!modelName) return [];
      const response = await request(ApiEnum.GET_PART_CATEGORY_BY_MODEL, {
        model: modelName,
      });
      console.log("Category-by-model response:", response);

      const resolveList = (value) => {
        if (!value && value !== "") return [];
        if (typeof value === "string") return [value];
        if (Array.isArray(value)) return value;
        if (typeof value === "object") return [value];
        return [];
      };

      const raw = resolveList(response?.data ?? response);

      return raw
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.categoryName || item?.category
        )
        .filter(Boolean);
    } catch (error) {
      console.error("Error fetching category by model:", error);
      return [];
    }
  }, []);

  //  Hàm upload hình ảnh kèm mô tả tiếng Việt từng bước
  const uploadImages = async (claimId, files = []) => {
    if (!claimId || !files.length) return [];

    try {
      //  Tạo formData để chứa danh sách file gửi lên server
      const formData = new FormData();

      //  Mỗi file được thêm vào formData với key là "files"
      files.forEach((f) => formData.append("files", f));

      // Log để kiểm tra dữ liệu formData trước khi gửi
      for (let [key, value] of formData.entries()) {
        console.log(`Key: ${key}, Value: ${value.name || value}`);
      }

      // Gửi request lên API /images/multi/:claimId
      const res = await uploadFiles(ApiEnum.UPLOAD_IMAGE, {
        params: { claimId }, // claimId sẽ thay thế :claimId trong path
        files: files, // uploadFiles sẽ tự động xử lý files array
      });

      // Chuẩn hóa dữ liệu trả về
      const uploaded = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      console.log(" Upload thành công:", uploaded);
      return uploaded;
    } catch (err) {
      console.error(" Lỗi khi upload hình:", err);
      return [];
    }
  };

  // Submit inspection result
  const submitInspection = async (claimId, payload = {}) => {
    if (!claimId) throw new Error("Missing claimId");
    const res = await request(ApiEnum.WARRANTY_INSPECTION, {
      params: { claimId },
      ...payload,
    });
    const { pageNumber, pageSize } = paginationRef.current;
    await fetchWorkOrders(pageNumber, pageSize, searchRef.current, targetRef.current, typeRef.current);
    return res;
  };

  // Submit repair info
  const submitRepair = async (targetId, payload = {}, options = {}) => {
    if (!targetId) throw new Error("Missing targetId");

    const { isCampaign = false } = options || {};
    const endpoint = isCampaign
      ? ApiEnum.REPAIRED_CAMPAIGN_VEHICLE
      : ApiEnum.WARRANTY_REPAIR;

    const data = {
      params: isCampaign ? { id: targetId } : { claimId: targetId },
      ...payload,
    };

    const res = await request(endpoint, data);
    const { pageNumber, pageSize } = paginationRef.current;
    await fetchWorkOrders(pageNumber, pageSize, searchRef.current, targetRef.current, typeRef.current);
    return res;
  };

  // Handler for the View button
  const handleViewWorkOrderDetail = (order) => {
    console.log("Viewing Work Order:", order);
    setSelectedWorkOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWorkOrder(null);
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchWorkOrders(page, size, searchRef.current, targetRef.current, typeRef.current);
    },
    [fetchWorkOrders]
  );

  const handleRefresh = useCallback(() => {
    fetchWorkOrders(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      targetRef.current,
      typeRef.current
    );
  }, [fetchWorkOrders]);

  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  const handleTargetFilterChange = (e) => {
    const value = e.target.value || "";
    setTargetFilter(value);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value || "";
    setTypeFilter(value);
  };

  return (
    <TechnicianVehicleStatusView
      data={workOrders}
      columns={columns} // Pass the updated columns
      loading={isLoading}
      error={error}
      pagination={pagination}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      refreshing={isLoading}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      targetFilter={targetFilter}
      onTargetFilterChange={handleTargetFilterChange}
      typeFilter={typeFilter}
      onTypeFilterChange={handleTypeFilterChange}
      selectedWorkOrder={selectedWorkOrder}
      showDetailModal={showDetailModal}
      onCloseDetailModal={handleCloseDetailModal}
      categories={categories} //Lưu dữ liệu thực tế để React render ra giao diện
      models={models}
      serials={serials}
      // pass helper functions so modal can load models/serials on demand
      fetchCategories={fetchCategories} // Gọi API, lấy dữ liệu và cập nhật vào state
      fetchModels={fetchModels}
      fetchSerial={fetchSerial}
      fetchCategoryByModel={fetchCategoryByModel}
      // API helpers passed to modal so network calls live in container
      uploadImages={uploadImages}
      submitInspection={submitInspection}
      submitRepair={submitRepair}
    />
  );
};

export default TechnicianVehicleStatusContainer;
