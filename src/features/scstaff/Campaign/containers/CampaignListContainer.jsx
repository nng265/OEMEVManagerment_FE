import React, { useState, useEffect, useCallback, useRef } from "react";
import CampaignList from "../components/CampaignList";
import ViewCampaignModal from "../components/CampaignViewModal";
import AddCampaignModal from "../components/CampaignCreateModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

const CampaignListContainer = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const pendingAddRef = useRef(null);

  const latestRequestRef = useRef(0);
  const paginationRef = useRef(pagination);
  const searchRef = useRef("");
  const typeFilterRef = useRef("");
  const statusFilterRef = useRef("");

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  // Debounce search query để tránh request liên tục
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay 500ms sau khi user ngừng gõ

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    typeFilterRef.current = typeFilter;
  }, [typeFilter]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  const fetchCampaigns = useCallback(async (pageNumber = 0, size = 10, search, type, status) => {
    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    const effectiveSearch = typeof search === "string" ? search : searchRef.current;
    const effectiveType = typeof type === "string" ? type : typeFilterRef.current;
    const effectiveStatus = typeof status === "string" ? status : statusFilterRef.current;

    try {
      const params = {
        Page: pageNumber,
        Size: size,
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

      const res = await request(ApiEnum.CAMPAIGN_SCSTAFF, params);

      if (requestId !== latestRequestRef.current) return;

      const items = Array.isArray(res.data?.items) ? res.data.items : [];

      setCampaigns(items);
      setPagination({
        pageNumber: res.data.pageNumber ?? pageNumber,
        pageSize: res.data.pageSize ?? size,
        totalRecords: res.data.totalRecords ?? items.length,
      });
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  // load technicians for create modal
  useEffect(() => {
    let mounted = true;
    const loadTechs = async () => {
      try {
        const res = await request(ApiEnum.GET_TECHNICIANS, {});
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
        if (mounted) setTechnicianOptions(list);
      } catch (err) {
        console.error("Failed to load technicians", err);
      }
    };
    loadTechs();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchCampaigns(0, pagination.pageSize, debouncedSearchQuery, typeFilter, statusFilter);
  }, [fetchCampaigns, pagination.pageSize, debouncedSearchQuery, typeFilter, statusFilter]);

  const handlePageChange = (pageIndex, newPageSize) => {
    fetchCampaigns(pageIndex, newPageSize, searchRef.current, typeFilterRef.current, statusFilterRef.current);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value || "";
    setTypeFilter(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value || "";
    setStatusFilter(value);
  };

  const handleView = (campaign) => {
    setSelectedCampaign(campaign);
    setShowViewModal(true);
  };

  // If called from a row, accept the campaign to preselect; otherwise open blank
  const handleAdd = (campaign) => {
    setSelectedCampaign(campaign ?? null);
    setShowAddModal(true);
  };

  const handleAddSubmit = (newCampaign) => {
    // Open confirmation first
    pendingAddRef.current = newCampaign;
    const vin = newCampaign?.vin || "";
    setConfirmTitle("Confirm Add Vehicle to Campaign");
    setConfirmMessage(
      vin
        ? `Assign VIN ${vin} to this campaign?`
        : "Assign this vehicle to the campaign?"
    );
    setIsConfirmOpen(true);
  };

  const performAddSubmit = async () => {
    const newCampaign = pendingAddRef.current;
    if (!newCampaign) {
      setIsConfirmOpen(false);
      return;
    }
    setIsActionLoading(true);
    try {
      const rawCampaign = campaigns.find(
        (c) => (c._raw?.campaignId ?? c.id) === newCampaign.campaignId
      )?._raw;

      const payload = {
        campaignId:
          newCampaign.campaignId ||
          (rawCampaign?.campaignId ?? rawCampaign?.id) ||
          "",
        vin: newCampaign.vin || "",
        assignedTo: Array.isArray(newCampaign.technicians)
          ? newCampaign.technicians
          : [],
      };

      const res = await request(ApiEnum.CREATE_COMPAIGN_VEHICLE, payload);
      if (res?.success) {
        toast.success(
          res?.message || "Added vehicle to campaign successfully!"
        );
      } else {
        const msg = res?.message || "Failed to add vehicle to campaign.";
        toast.error(msg);
      }
      setShowAddModal(false);
      await fetchCampaigns(
        paginationRef.current.pageNumber,
        paginationRef.current.pageSize,
        searchRef.current,
        typeFilterRef.current,
        statusFilterRef.current
      );
    } catch (err) {
      console.error("Failed to create campaign:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "Failed to create campaign. Please try again.";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      pendingAddRef.current = null;
    }
  };

  const handleRefresh = useCallback(() => {
    fetchCampaigns(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      typeFilterRef.current,
      statusFilterRef.current
    );
  }, [fetchCampaigns]);

  return (
    <>
      <CampaignList
        data={campaigns}
        loading={loading}
        error={error}
        pagination={pagination}
        serverSide={true}
        onView={handleView}
        onAdd={handleAdd}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <ViewCampaignModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        campaign={selectedCampaign}
      />

      <AddCampaignModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        campaignOptions={campaigns.map((c) => c._raw ?? c)}
        technicianOptions={technicianOptions}
        initialCampaign={selectedCampaign?._raw ?? selectedCampaign ?? null}
        initialCampaignId={
          selectedCampaign?._raw?.campaignId ?? selectedCampaign?.id ?? ""
        }
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={performAddSubmit}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default CampaignListContainer;
