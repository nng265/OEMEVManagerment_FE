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
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const [clientPagination, setClientPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
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
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // ===== FETCH LIST =====
  const fetchCampaign = useCallback(async (pageNumber = 0, size) => {
    const effectiveSize =
      typeof size === "number" && size > 0
        ? size
        : paginationRef.current.pageSize;
    const effectivePage =
      typeof pageNumber === "number" && pageNumber >= 0
        ? pageNumber
        : paginationRef.current.pageNumber;

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const response = await request(ApiEnum.GET_CAMPAIGNS, {
        Page: effectivePage,
        Size: effectiveSize,
      });

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
        }));

        setCampaigns(normalized);
        setFilteredCampaigns(normalized);
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
        setFilteredCampaigns([]);
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
        setFilteredCampaigns([]);
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
    fetchCampaign(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize
    );
  }, [fetchCampaign]);

  // ===== SEARCH + FILTER =====
  useEffect(() => {
    let result = [...campaigns];

    // search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }

    // filter by type
    if (selectedType) {
      result = result.filter((c) => c.type === selectedType);
    }

    // filter by status
    if (selectedStatus) {
      result = result.filter((c) => c.status === selectedStatus);
    }

    setFilteredCampaigns(result);
  }, [campaigns, searchQuery, selectedType, selectedStatus]);

  useEffect(() => {
    setClientPagination((prev) => ({ ...prev, pageNumber: 0 }));
  }, [searchQuery, selectedType, selectedStatus]);

  const filtersActive =
    Boolean(searchQuery) || Boolean(selectedType) || Boolean(selectedStatus);

  const handleSearch = useCallback((query) => setSearchQuery(query || ""), []);
  const handleTypeFilter = useCallback(
    (type) => setSelectedType(type || ""),
    []
  );
  const handleStatusFilter = useCallback(
    (status) => setSelectedStatus(status || ""),
    []
  );

  // ===== ADD + VIEW =====
  const handleViewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleAddCampaign = () => setShowAddModal(true);

  const handleAddSubmit = async (newCampaign) => {
    try {
      const payload = {
        type: newCampaign.type || "",
        title: newCampaign.title || "",
        // description: newCampaign.description || "",
        partModel: newCampaign.target || "",

        startDate: newCampaign.startDate
          ? new Date(newCampaign.startDate).toISOString()
          : "",
        endDate: newCampaign.endDate
          ? new Date(newCampaign.endDate).toISOString()
          : "",
      };

      console.log(" Sending payload:", payload);

      const res = await request(ApiEnum.CREATE_CAMPAIGN, payload);
      console.log("API Response:", res);

      await fetchCampaign(
        paginationRef.current.pageNumber,
        paginationRef.current.pageSize
      );
    } catch (e) {
      console.error("❌ Lỗi khi tạo campaign:", e);
    } finally {
      setShowAddModal(false);
    }
  };

  // ===== PAGINATION =====
  const derivedPagination = useMemo(
    () =>
      filtersActive
        ? {
            pageNumber: clientPagination.pageNumber,
            pageSize: clientPagination.pageSize,
            totalRecords: filteredCampaigns.length,
          }
        : pagination,
    [filtersActive, clientPagination, pagination, filteredCampaigns.length]
  );

  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      if (filtersActive) {
        setClientPagination((prev) => ({
          pageNumber: Math.max(
            0,
            typeof pageIndex === "number" ? pageIndex : prev.pageNumber
          ),
          pageSize: newPageSize || prev.pageSize,
        }));
      } else {
        fetchCampaign(pageIndex, newPageSize || paginationRef.current.pageSize);
      }
    },
    [filtersActive, fetchCampaign]
  );

  // ===== RENDER =====
  return (
    <div>
      <Campaign
        data={filtersActive ? filteredCampaigns : campaigns}
        loading={loading}
        error={error}
        pagination={derivedPagination}
        serverSide={!filtersActive}
        onView={handleViewCampaign}
        onAdd={handleAddCampaign}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterType={handleTypeFilter}
        onFilterStatus={handleStatusFilter}
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
