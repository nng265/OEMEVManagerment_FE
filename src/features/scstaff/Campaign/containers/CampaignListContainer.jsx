import React, { useState, useEffect, useCallback, useRef } from "react";
import CampaignList from "../components/CampaignList";
import ViewCampaignModal from "../components/CampaignViewModal";
import AddCampaignModal from "../components/CampaignCreateModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";

const CampaignListContainer = () => {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [technicianOptions, setTechnicianOptions] = useState([]);

  // removed unused paginationRef
  const latestRequestRef = useRef(0);

  const fetchCampaigns = useCallback(async (pageNumber = 0, size = 10) => {
    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await request(ApiEnum.CAMPAIGN_SCSTAFF, {
        Page: pageNumber,
        Size: size,
      });

      if (requestId !== latestRequestRef.current) return;

      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      const normalized = items.map((item, index) => ({
        id: item.campaignId ?? index,
        title: item.title ?? "",
        type: item.type ?? "",
        partModel: item.partModel ?? "",
        description: item.description ?? "",
        startDate: item.startDate,
        endDate: item.endDate,
        period:
          item.startDate && item.endDate
            ? `${item.startDate} to ${item.endDate}`
            : "",
        status: item.status ?? "",
        _raw: item,
      }));

      setCampaigns(normalized);
      setFilteredCampaigns(normalized);
      setPagination({
        pageNumber: res.data.pageNumber ?? pageNumber,
        pageSize: res.data.pageSize ?? size,
        totalRecords: res.data.totalRecords ?? normalized.length,
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
    fetchCampaigns(pagination.pageNumber, pagination.pageSize);
  }, [fetchCampaigns, pagination.pageNumber, pagination.pageSize]);

  useEffect(() => {
    let result = [...campaigns];
    if (searchQuery)
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedType) result = result.filter((c) => c.type === selectedType);
    if (selectedStatus)
      result = result.filter((c) => c.status === selectedStatus);
    setFilteredCampaigns(result);
    setClientPagination((prev) => ({ ...prev, pageNumber: 0 }));
  }, [campaigns, searchQuery, selectedType, selectedStatus]);

  const filtersActive = searchQuery || selectedType || selectedStatus;

  const handlePageChange = (pageIndex, newPageSize) => {
    if (filtersActive) {
      setClientPagination({ pageNumber: pageIndex, pageSize: newPageSize });
    } else {
      fetchCampaigns(pageIndex, newPageSize);
    }
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

  const handleAddSubmit = async (newCampaign) => {
    // newCampaign contains { campaignId, type, vin, technicians }
    try {
      // find the original campaign object from loaded campaigns if available
      const rawCampaign = campaigns.find(
        (c) => (c._raw?.campaignId ?? c.id) === newCampaign.campaignId
      )?._raw;

      // Create a CampaignVehicle (assign vehicle to campaign)
      const payload = {
        campaignId: newCampaign.campaignId || (rawCampaign?.campaignId ?? rawCampaign?.id) || "",
        vin: newCampaign.vin || "",
        assignedTo: Array.isArray(newCampaign.technicians)
          ? newCampaign.technicians
          : [],
      };

      const res = await request(ApiEnum.CREATE_COMPAIGN_VEHICLE, payload);
      if (res?.message) alert(res.message);
      setShowAddModal(false);
      await fetchCampaigns(pagination.pageNumber, pagination.pageSize);
    } catch (err) {
      console.error("Failed to create campaign:", err);
      alert("Failed to create campaign. Please try again.");
    }
  };

  return (
    <>
      <CampaignList
        data={filtersActive ? filteredCampaigns : campaigns}
        loading={loading}
        error={error}
        pagination={
          filtersActive
            ? {
                pageNumber: clientPagination.pageNumber,
                pageSize: clientPagination.pageSize,
                totalRecords: filteredCampaigns.length,
              }
            : pagination
        }
        serverSide={!filtersActive}
        onView={handleView}
        onAdd={handleAdd}
        onPageChange={handlePageChange}
        onSearch={setSearchQuery}
        onFilterType={setSelectedType}
        onFilterStatus={setSelectedStatus}
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
    </>
  );
};

export default CampaignListContainer;
