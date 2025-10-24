// src/features/warranty/containers/WarrantyClaimListContainer.jsx
import React, { useState, useEffect } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { Button } from "../../../components/atoms";
import { WarrantyClaimListView } from "../components/WarrantyClaimListView";

export const WarrantyClaimListContainer = () => {
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Các modal mới cho từng trạng thái
  const [showPendingConfirmationModal, setShowPendingConfirmationModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [showDeniedOrRepairedModal, setShowDeniedOrRepairedModal] = useState(false);
  const [showCarBackHomeModal, setShowCarBackHomeModal] = useState(false);
  const [showSentToManufacturerModal, setShowSentToManufacturerModal] = useState(false);
  const [showUnderInspectionModal, setShowUnderInspectionModal] = useState(false);
  const [showUnderRepairModal, setShowUnderRepairModal] = useState(false);
  const [showDoneWarrantyModal, setShowDoneWarrantyModal] = useState(false);
  
  const [selectedWarrantyClaim, setSelectedWarrantyClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);

  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  
  // State for assigned technicians (for under inspection and under repair)
  const [assignedTechnicians, setAssignedTechnicians] = useState([]);
  const [loadingAssignedTechs, setLoadingAssignedTechs] = useState(false);

  // ========================== TABLE COLUMNS ==========================
  const columns = [
    { key: "vin", label: "VIN", sortable: true },
    {
      key: "createdDate",
      label: "Created Date",
      sortable: true,
      render: (value) => {
        if (!value) return "–";
        try {
          return new Date(value).toLocaleDateString("en-US");
        } catch {
          return value;
        }
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
        const statusClass = (value || "unknown")
          .toLowerCase()
          .replace(/_/g, "-");
        return (
          <span className={`status-badge status-${statusClass}`}>{value}</span>
        );
      },
    },
    { key: "description", label: "Description", sortable: false },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button
          variant="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(row);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // ========================== FETCH DATA ==========================
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await request(ApiEnum.GET_WARRANTY_STATUSES);
        if (response.success && Array.isArray(response.data)) {
          setStatusOptions([
            { value: "", label: "All Statuses" },
            ...response.data.map((s) => ({ value: s, label: s })),
          ]);
        }
      } catch (err) {
        console.error("Error loading status options:", err);
        setStatusOptions([{ value: "", label: "All Statuses" }]);
      }
    };
    fetchStatusOptions();
  }, []);

  const fetchTechnicians = async () => {
  setLoadingTechnicians(true);
  try {
    const response = await request(ApiEnum.GET_TECHNICIANS);
    if (response.success && Array.isArray(response.data)) {
      setTechnicians(response.data);
    } else {
      setTechnicians([]);
    }
  } catch (error) {
    console.error("Error fetching technicians:", error);
    setTechnicians([]);
  } finally {
    setLoadingTechnicians(false);
  }
};

  useEffect(() => {
    fetchWarrantyClaims();
  }, [statusFilter]);

  const fetchWarrantyClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = statusFilter
        ? await request(ApiEnum.GET_WARRANTY_CLAIMS_BY_STATUS, { params: { status: statusFilter } })
        : await request(ApiEnum.GET_WARRANTY_CLAIMS);
      
      setWarrantyClaims(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("An error occurred. Please try again later.");
      setWarrantyClaims([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assigned technicians for a specific claim
  const fetchAssignedTechnicians = async (claimId) => {
    if (!claimId) {
      setAssignedTechnicians([]);
      return;
    }

    setLoadingAssignedTechs(true);
    try {
      const response = await request(ApiEnum.GET_ASSIGNED_TECHNICIANS, {
        params: { claimId }
      });

      if (response.success && Array.isArray(response.data)) {
        setAssignedTechnicians(response.data);
      } else {
        setAssignedTechnicians([]);
      }
    } catch (error) {
      console.error('Error fetching assigned technicians:', error);
      setAssignedTechnicians([]);
    } finally {
      setLoadingAssignedTechs(false);
    }
  };

  // ========================== VIEW DETAIL ==========================
  const handleViewDetail = async (warrantyData) => {
    if (!warrantyData) return;
    const status = warrantyData.status?.toLowerCase().replace(/[_\s]+/g, " ").trim();
    setSelectedWarrantyClaim(warrantyData);

    // Đóng tất cả modal trước
    setShowAssignModal(false);
    setShowPendingConfirmationModal(false);
    setShowApprovedModal(false);
    setShowDeniedOrRepairedModal(false);
    setShowCarBackHomeModal(false);
    setShowSentToManufacturerModal(false);
    setShowUnderInspectionModal(false);
    setShowUnderRepairModal(false);
    setShowDoneWarrantyModal(false);
    setShowDetailModal(false);

    // Mở modal tương ứng với trạng thái
    if (status === "waiting for unassigned" || status === "waiting for unassigned repair") {
      setShowAssignModal(true);
    } else if (status === "under inspection") {
      await fetchAssignedTechnicians(warrantyData.claimId);
      setShowUnderInspectionModal(true);
    } else if (status === "under repair") {
      await fetchAssignedTechnicians(warrantyData.claimId);
      setShowUnderRepairModal(true);
    } else if (status === "pending confirmation") {
      setShowPendingConfirmationModal(true);
    } else if (status === "approved") {
      setShowApprovedModal(true);
    } else if (status === "denied" || status === "repaired") {
      setShowDeniedOrRepairedModal(true);
    } else if (status === "car back home") {
      setShowCarBackHomeModal(true);
    } else if (status === "sent to manufacturer") {
      setShowSentToManufacturerModal(true);
    } else if (status === "done warranty") {
      setShowDoneWarrantyModal(true);
    } else {
      setShowDetailModal(true);
    }
  };

  // ========================== MODAL CLOSE ==========================
  const handleCloseDetail = () => setShowDetailModal(false);
  const handleCloseAssign = () => setShowAssignModal(false);
  const handleClosePendingConfirmation = () => setShowPendingConfirmationModal(false);
  const handleCloseApproved = () => setShowApprovedModal(false);
  const handleCloseDeniedOrRepaired = () => setShowDeniedOrRepairedModal(false);
  const handleCloseCarBackHome = () => setShowCarBackHomeModal(false);
  const handleCloseSentToManufacturer = () => setShowSentToManufacturerModal(false);
  const handleCloseUnderInspection = () => setShowUnderInspectionModal(false);
  const handleCloseUnderRepair = () => setShowUnderRepairModal(false);
  const handleCloseDoneWarranty = () => setShowDoneWarrantyModal(false);

  // ========================== ASSIGN TECH ==========================
  const handleAssignSubmit = async (assignmentData) => {
    if (!selectedWarrantyClaim) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        params: {
          targetId: selectedWarrantyClaim.claimId
        },
        target: 'Warranty',
        assignedTo: assignmentData.technicians
      };

      const response = await request(ApiEnum.ASSIGN_TECHNICIAN, payload);
      if (response.success) {
        handleCloseAssign();
        fetchWarrantyClaims();
      } else {
        setError(response.message || "Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning technician:", error);
      setError("An error occurred while assigning technician");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================== CLAIM ACTIONS (MAIN) ==========================
  const handleClaimAction = async (action, payload) => {
    if (!selectedWarrantyClaim || !selectedWarrantyClaim.claimId) {
      setError("Missing warranty claim information.");
      return;
    }

    const claimId = selectedWarrantyClaim.claimId;
    let apiEndpoint = null;
    let requestData = {};

    switch (action) {
      case "sendToManufacturer":
        apiEndpoint = ApiEnum.SEND_CLAIM_TO_MANUFACTURER;
        requestData = { params: { claimId } };
        break;

      case "reject":
        apiEndpoint = ApiEnum.DENY_WARRANTY_CLAIM;
        requestData = { params: { claimId } };
        break;

      case "needMoreInfo":
        apiEndpoint = ApiEnum.BACK_WARRANTY_CLAIM;
        requestData = { 
          params: { claimId },
          description: payload.description,
          assignsTo: payload.assignsTo
        };
        break;

      case "doneWarranty":
        apiEndpoint = ApiEnum.DONE_WARRANTY;
        requestData = { params: { claimId } };
        break;

      case "carBackHome":
        apiEndpoint = ApiEnum.CAR_BACK_HOME;
        requestData = { params: { claimId } };
        break;

      case "carBackCenter":
        apiEndpoint = ApiEnum.CAR_BACK_CENTER;
        requestData = { params: { claimId } };
        break;

      default:
        console.warn("Unknown claim action:", action);
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await request(apiEndpoint, requestData);
      
      if (response.success) {
        // Đóng tất cả modal
        handleClosePendingConfirmation();
        handleCloseApproved();
        handleCloseDeniedOrRepaired();
        handleCloseCarBackHome();
        handleCloseSentToManufacturer();
        fetchWarrantyClaims();
      } else {
        setError(response.message || "Operation failed. Please try again.");
      }
    } catch (err) {
      console.error(`Error performing '${action}' request:`, err);
      setError("A system or network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================== RENDER ==========================
  return (
    <WarrantyClaimListView
      data={warrantyClaims}
      columns={columns}
      loading={isLoading}
      error={error}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusOptions={statusOptions}
      selectedClaim={selectedWarrantyClaim}
      
      // Default detail modal
      showDetailModal={showDetailModal}
      onCloseDetailModal={handleCloseDetail}
      
      // Assign modal
      showAssignModal={showAssignModal}
      onCloseAssignModal={handleCloseAssign}
      onAssignSubmit={handleAssignSubmit}
      
      // Status-specific modals
      showPendingConfirmationModal={showPendingConfirmationModal}
      onClosePendingConfirmationModal={handleClosePendingConfirmation}
      
      showApprovedModal={showApprovedModal}
      onCloseApprovedModal={handleCloseApproved}
      
      showDeniedOrRepairedModal={showDeniedOrRepairedModal}
      onCloseDeniedOrRepairedModal={handleCloseDeniedOrRepaired}
      
      showCarBackHomeModal={showCarBackHomeModal}
      onCloseCarBackHomeModal={handleCloseCarBackHome}
      
      showSentToManufacturerModal={showSentToManufacturerModal}
      onCloseSentToManufacturerModal={handleCloseSentToManufacturer}
      
      showUnderInspectionModal={showUnderInspectionModal}
      onCloseUnderInspectionModal={handleCloseUnderInspection}
      
      showUnderRepairModal={showUnderRepairModal}
      onCloseUnderRepairModal={handleCloseUnderRepair}
      
      showDoneWarrantyModal={showDoneWarrantyModal}
      onCloseDoneWarrantyModal={handleCloseDoneWarranty}
      
      // Actions
      onAction={handleClaimAction}

      // Technicians
      technicians={technicians}
      onFetchTechnicians={fetchTechnicians}
      loadingTechnicians={loadingTechnicians}
      
      // Assigned Technicians (for under inspection/repair)
      assignedTechnicians={assignedTechnicians}
      loadingAssignedTechs={loadingAssignedTechs}
    />
  );
};

export default WarrantyClaimListContainer;
