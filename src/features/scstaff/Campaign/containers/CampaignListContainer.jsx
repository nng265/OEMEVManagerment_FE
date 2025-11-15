import React, { useState, useEffect, useCallback, useRef } from "react";
import CampaignList from "../components/CampaignList";
import ViewCampaignModal from "../components/CampaignViewModal";
import AddCampaignModal from "../components/CampaignCreateModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const pendingAddRef = useRef(null);

  //Mục đích: tránh race condition khi người dùng thay đổi trang/trigger fetch nhanh (gọi fetchCampaigns nhiều lần);
  // chỉ xử lý response của request mới nhất.

  //Cách hoạt động: mỗi lần gọi fetchCampaigns tăng latestRequestRef.current;
  // khi response về, chỉ cập nhật state nếu requestId === latestRequestRef.current.

  //Lợi ích: tránh hiển thị dữ liệu cũ khi response chậm về sau response mới hơn.
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

      setCampaigns(items);
      setFilteredCampaigns(items);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalRecords: res.data.totalRecords,
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

  const handleAddSubmit = (newCampaign) => {
    // Open confirmation first
    //giữ dữ liệu tạm khi người dùng submit form (trong modal) nhưng cần xác nhận qua ConfirmDialog trước khi call API.
    //dùng ref thay vì state: ref không gây rerender khi thay đổi, và an toàn khi ta chỉ cần lưu giá trị
    // giữa các re-render cho action sắp diễn ra. Dùng state sẽ gây rerender không cần thiết.
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
      await fetchCampaigns(pagination.pageNumber, pagination.pageSize);
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
    fetchCampaigns(pagination.pageNumber, pagination.pageSize);
  }, [fetchCampaigns, pagination.pageNumber, pagination.pageSize]);

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
        onRefresh={handleRefresh}
        refreshing={loading}
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
