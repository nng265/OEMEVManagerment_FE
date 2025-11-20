import React, { useState, useEffect, useCallback, useRef } from "react";
import { request, uploadFiles, ApiEnum } from "../../../services/NetworkUntil";
import { TechnicianVehicleStatusView } from "../components/TechnicianVehicleStatusView";
import { formatDate, normalizePagedResult } from "../../../services/helpers";
import { Button } from "../../../components/atoms";

export const TechnicianVehicleStatusContainer = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [serials, setSerials] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const columns = [
    {
      key: "vin",
      label: "VIN",
      sortable: true,
      render: (_, row) => row?.vin || "-",
    },
    {
      key: "target",
      label: "Target",
      sortable: true,
      render: (_, row) => row.target || "-",
    },
    {
      key: "type",
      label: "Task",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
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
      key: "startDate",
      label: "Date",
      sortable: true,
      render: (value) =>
        formatDate(value, "vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="light"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleViewWorkOrderDetail(row);
          }}
        >
          <img src="/eye.png" style={{ width: "22px" }} alt="View" />
        </Button>
      ),
    },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORIES);
      const raw = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
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

  const fetchWorkOrders = useCallback(
    async (pageNumber = 0, pageSize, search, target, type) => {
      const effectivePageSize =
        typeof pageSize === "number"
          ? pageSize
          : paginationRef.current.pageSize;
      const effectiveSearch =
        typeof search === "string" ? search : searchRef.current;
      const effectiveTarget =
        typeof target === "string" ? target : targetRef.current;
      const effectiveType = typeof type === "string" ? type : typeRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const params = {
          Page: pageNumber,
          Size: effectivePageSize,
        };

        if (effectiveSearch && effectiveSearch.trim()) {
          params.Search = effectiveSearch.trim();
        }

        if (effectiveTarget && effectiveTarget.trim()) {
          params.Target = effectiveTarget.trim();
        }

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
    },
    []
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchWorkOrders(
      0,
      paginationRef.current.pageSize,
      debouncedSearchQuery,
      targetFilter,
      typeFilter
    );
  }, [fetchWorkOrders, debouncedSearchQuery, targetFilter, typeFilter]);

  const fetchModels = async (categoryName) => {
    try {
      if (!categoryName) {
        setModels([]);
        return [];
      }
      const response = await request(ApiEnum.GET_PART_MODELS, {
        category: categoryName,
      });
      const mods = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setModels(mods);
      return mods;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  };

  const fetchSerial = async (vin, modelName) => {
    try {
      if (!vin || !modelName) {
        setSerials([]);
        return [];
      }

      const response = await request(ApiEnum.GET_PART_SERIAL, {
        vin: vin,
        model: modelName,
      });

      const sers = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setSerials(sers);
      return sers;
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

  const uploadImages = async (claimId, files = []) => {
    if (!claimId || !files.length) return [];

    try {
      //  tao formData de chua danh sach file gui len server
      const formData = new FormData();

      //  MMoi file duoc them vao formData voi key la "files"
      files.forEach((f) => formData.append("files", f));

      // Log de kiem tra du lieu formData trc khi gui
      for (let [key, value] of formData.entries()) {
        // debug mapping key -> value
      }

      // GGui request len API /images/multi/:claimId
      const res = await uploadFiles(ApiEnum.UPLOAD_IMAGE, {
        params: { claimId }, // claimId se thay the :claimId trong path
        files: files, // uploadFiles tu dong xu li files array
      });

      const uploaded = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      // uploaded images handled
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
    await fetchWorkOrders(
      pageNumber,
      pageSize,
      searchRef.current,
      targetRef.current,
      typeRef.current
    );
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
    await fetchWorkOrders(
      pageNumber,
      pageSize,
      searchRef.current,
      targetRef.current,
      typeRef.current
    );
    return res;
  };

  const handleViewWorkOrderDetail = (order) => {
    setSelectedWorkOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWorkOrder(null);
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchWorkOrders(
        page,
        size,
        searchRef.current,
        targetRef.current,
        typeRef.current
      );
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
      columns={columns}
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
      categories={categories}
      models={models}
      serials={serials}
      fetchCategories={fetchCategories}
      fetchModels={fetchModels}
      fetchSerial={fetchSerial}
      fetchCategoryByModel={fetchCategoryByModel}
      uploadImages={uploadImages}
      submitInspection={submitInspection}
      submitRepair={submitRepair}
    />
  );
};

export default TechnicianVehicleStatusContainer;
