// src/features/car/containers/CarListContainer.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { CarListView } from "../components/CarListView";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { Button } from "../../../../components/atoms/Button/Button";
import { normalizePagedResult } from "../../../../services/helpers";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

export const CarListContainer = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Pagination từ BE (page bắt đầu = 0, size = 20)
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const paginationRef = useRef(pagination);
  const searchRef = useRef(searchQuery);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchRef.current = searchQuery;
  }, [searchQuery]);

  // --- Fetch dữ liệu từ BE ---
  const fetchVehicles = useCallback(async (pageNumber = 0, pageSize, search) => {
    const effectivePageSize =
      typeof pageSize === "number" ? pageSize : paginationRef.current.pageSize;
    const effectiveSearch =
      typeof search === "string" ? search : searchRef.current;

    try {
      setLoading(true);
      setError(null);
      setSubmitError(null);

      const params = {
        Page: pageNumber,
        Size: effectivePageSize,
      };

      // Thêm search query nếu có
      if (effectiveSearch && effectiveSearch.trim()) {
        params.Search = effectiveSearch.trim();
      }

      const response = await request(ApiEnum.GET_VEHICLES, params);

      const { success, items, totalRecords, page, size, message } =
        normalizePagedResult(response, []);

      if (success) {
        setVehicles(items);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize:
            typeof size === "number" && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } else {
        setVehicles([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load vehicle list.");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const message =
        err?.responseData?.message ||
        err?.message ||
        "An error occurred while loading the vehicle list.";
      setVehicles([]);
      setPagination((prev) => ({
        ...prev,
        pageNumber,
        pageSize: effectivePageSize,
        totalRecords: 0,
      }));
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Gọi API lần đầu ---
  useEffect(() => {
    fetchVehicles(0, paginationRef.current.pageSize);
  }, [fetchVehicles]);

  // --- Handlers ---
  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSubmitError(null);
    setShowDetailModal(true);
  };

  const handleCreateWarrantyClaim = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSubmitError(null);
    setShowWarrantyModal(true);
  };

  const handlePageChange = useCallback(
    (page, size) => {
      fetchVehicles(page, size, searchRef.current);
    },
    [fetchVehicles]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Reset về trang đầu khi search
    fetchVehicles(0, paginationRef.current.pageSize, value);
  };

  const handleWarrantySubmit = (formData) => {
    // Open confirmation dialog first, do not call API yet
    setPendingFormData(formData);
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedVehicle || !selectedVehicle.vin || !pendingFormData) {
      setSubmitError("Missing vehicle information.");
      setIsConfirmOpen(false);
      return;
    }

    const payload = {
      vin: selectedVehicle.vin,
      failureDesc: pendingFormData.description,
      assignsTo: pendingFormData.assignTech
        ? pendingFormData.technicianIds
        : [],
    };

    setIsActionLoading(true);
    try {
      const response = await request(ApiEnum.CREATE_WARRANTY_CLAIM, payload);
      if (response.success) {
        setShowWarrantyModal(false);
        setIsConfirmOpen(false);
        setSelectedVehicle(null);
        setPendingFormData(null);
        toast.success("Warranty claim created successfully!");
      } else {
        const msg = response.message || "Unable to create warranty claim.";
        setSubmitError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Error creating warranty claim:", err);
      const msg = "System error. Please try again later.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
  };

  const handleRefresh = useCallback(() => {
    fetchVehicles(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current
    );
  }, [fetchVehicles]);

  // --- Cấu hình DataTable ---
  const columns = [
    { key: "vin", label: "VIN" },
    { key: "customerName", label: "Customer" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year", sortType: "number" },
    {
      className: "title",
      key: "actions",
      label: " Actions",
      sortable: false,
      render: (_, row) => (
        <div className="action-buttons">
          <Button
            variant="light"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
          >
            <img
              src="../../../../../public/eye.png"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>
          <Button
            className="variant-primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateWarrantyClaim(row);
            }}
          >
            🛠️ Create Warranty
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CarListView
        vehicles={vehicles}
        columns={columns}
        loading={loading}
        error={error}
        selectedVehicle={selectedVehicle}
        showDetailModal={showDetailModal}
        showWarrantyModal={showWarrantyModal}
        onWarrantySubmit={handleWarrantySubmit}
        onCloseDetailModal={() => setShowDetailModal(false)}
        onCloseWarrantyModal={() => {
          setShowWarrantyModal(false);
          setSubmitError(null);
          setPendingFormData(null);
        }}
        pagination={pagination}
        // ✅ Gọi lại API khi đổi trang hoặc page size
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Warranty Claim Creation"
        message={
          selectedVehicle?.vin
            ? `Are you sure you want to create a warranty claim for VIN ${selectedVehicle.vin}?`
            : "Are you sure you want to create a warranty claim?"
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelConfirm}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default CarListContainer;
