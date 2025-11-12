import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Campaign from "../components/Campaign";
import { ViewCampaignModal } from "../components/ViewCampaignModal";
import { AddCampaignModal } from "../components/AddCampaignModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";

// ================== CONTAINER ==================
export const EVMStaffCampaignContainer = () => {
  // --- STATE ---
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  const paginationRef = useRef(pagination);
  const latestRequestRef = useRef(0);
  
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // --- MODAL STATES ---
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const searchRef = useRef("");
  const typeRef = useRef("");
  const statusRef = useRef("");

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  useEffect(() => {
    typeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    statusRef.current = selectedStatus;
  }, [selectedStatus]);

  // Debounce search query để tránh request liên tục
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay 500ms sau khi user ngừng gõ

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ===== FETCH LIST =====
  const fetchCampaign = useCallback(async (pageNumber = 0, size, search, type, status) => {
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
    const effectiveType =
      typeof type === "string" ? type : typeRef.current;
    const effectiveStatus =
      typeof status === "string" ? status : statusRef.current;

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

      // Thêm type filter nếu có
      if (effectiveType && effectiveType.trim()) {
        params.Type = effectiveType.trim();
      }

      // Thêm status filter nếu có
      if (effectiveStatus && effectiveStatus.trim()) {
        params.Status = effectiveStatus.trim();
      }

      const response = await request(ApiEnum.CAMPAIGN_SCSTAFF, params);

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
        const normalized = rawItems.map((it, index) => ({
          // id: it.id ?? index,
          description: it.description || "",
          title: it.title ?? it.titleId ?? "",
          type: it.type ?? "",
          target: it.partModel || "",
          startDate: it.startDate,
          endDate: it.endDate,
          period:
            it.period ||
            (it.startDate && it.endDate
              ? `${it.startDate} to ${it.endDate}`
              : undefined),
          status: it.status ?? "",
          _raw: it,
          totalAffectedVehicles: it.totalAffectedVehicles || 0,
          pendingVehicles: it.pendingVehicles || 0,
          inProgressVehicles: it.inProgressVehicles || 0,
          completedVehicles: it.completedVehicles || 0,
        }));

        setCampaigns(normalized);
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
        setCampaigns([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: effectivePage,
          pageSize: effectiveSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load campaign.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi load campaigns:", err);
      if (requestId === latestRequestRef.current) {
        const message =
          err?.responseData?.message ||
          err?.message ||
          "Unable to load campaigns.";
        setCampaigns([]);
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

  // Fetch khi filters thay đổi
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchCampaign(0, paginationRef.current.pageSize, debouncedSearchQuery, selectedType, selectedStatus);
  }, [fetchCampaign, debouncedSearchQuery, selectedType, selectedStatus]);

  // ===== HANDLERS =====
  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value || "";
    setSelectedType(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value || "";
    setSelectedStatus(value);
  };

  // ===== ADD + VIEW =====
  const handleViewCampaign = (campaign) => {
    console.log(" Viewing campaign:", campaign);
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleAddCampaign = () => setShowAddModal(true);

  const handleAddSubmit = async (newCampaign) => {
    try {
      const payload = {
        type: newCampaign?.type ?? "",
        title: newCampaign?.title ?? "",
        description: newCampaign?.description ?? "",
        partModel: newCampaign?.partModel ?? null,
        replacementPartModel: newCampaign?.replacementPartModel ?? null,
        startDate: newCampaign?.startDate ?? "",
        endDate: newCampaign?.endDate ?? "",
      };

      console.log(" Sending payload:", payload);

      const res = await request(ApiEnum.CREATE_COMPAIGN, payload);
      console.log("API Response:", res);

      await fetchCampaign(
        paginationRef.current.pageNumber,
        paginationRef.current.pageSize,
        searchRef.current,
        typeRef.current,
        statusRef.current
      );
    } catch (e) {
      console.error("❌ Lỗi khi tạo campaign:", e);
    } finally {
      setShowAddModal(false);
    }
  };

  // ===== PAGINATION =====
  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      fetchCampaign(
        pageIndex,
        newPageSize || paginationRef.current.pageSize,
        searchRef.current,
        typeRef.current,
        statusRef.current
      );
    },
    [fetchCampaign]
  );

  const handleRefresh = useCallback(() => {
    fetchCampaign(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      typeRef.current,
      statusRef.current
    );
  }, [fetchCampaign]);

  // ===== RENDER =====
  return (
    <div style={{ marginTop: 40 }}>
      <Campaign
        data={campaigns}
        loading={loading}
        error={error}
        pagination={pagination}
        serverSide={true}
        onView={handleViewCampaign}
        onAdd={handleAddCampaign}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        typeFilter={selectedType}
        onTypeFilterChange={handleTypeFilterChange}
        statusFilter={selectedStatus}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <ViewCampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        campaign={selectedCampaign}
      />

      <AddCampaignModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default EVMStaffCampaignContainer;
