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
  const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalRecords: 0 });
  const [clientPagination, setClientPagination] = useState({ pageNumber: 0, pageSize: 10 });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const paginationRef = useRef(pagination);
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
        period: item.startDate && item.endDate ? `${item.startDate} to ${item.endDate}` : "",
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

  useEffect(() => {
    fetchCampaigns(pagination.pageNumber, pagination.pageSize);
  }, [fetchCampaigns]);

  useEffect(() => {
    let result = [...campaigns];
    if (searchQuery) result = result.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedType) result = result.filter(c => c.type === selectedType);
    if (selectedStatus) result = result.filter(c => c.status === selectedStatus);
    setFilteredCampaigns(result);
    setClientPagination(prev => ({ ...prev, pageNumber: 0 }));
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

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (newCampaign) => {
    console.log("Submitted new campaign:", newCampaign);
    setShowAddModal(false);
    await fetchCampaigns(pagination.pageNumber, pagination.pageSize);
  };

  return (
    <>
      <CampaignList
        data={filtersActive ? filteredCampaigns : campaigns}
        loading={loading}
        error={error}
        pagination={filtersActive ? {
          pageNumber: clientPagination.pageNumber,
          pageSize: clientPagination.pageSize,
          totalRecords: filteredCampaigns.length,
        } : pagination}
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
      />
    </>
  );
};

export default CampaignListContainer;
