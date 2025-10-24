// src/features/car/containers/CarListContainer.jsx
import React, { useEffect, useState } from 'react';
import { CarListView } from '../components/CarListView';
import { request, ApiEnum } from '../../../services/NetworkUntil';
import { Button } from '../../../components/atoms/Button/Button';

export const CarListContainer = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Giữ state này
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [submitError, setSubmitError] = useState(null); // Tùy chọn: State cho lỗi submit

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        setSubmitError(null); // Clear old submit error when reloading

        const response = await request(ApiEnum.GET_VEHICLES);
        if (response.success) {
          // Ensure data is always an array
          setVehicles(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Unable to load vehicle list');
          setVehicles([]); // Set empty array on error
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('An error occurred while loading the vehicle list. Please try again later.');
        setVehicles([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []); // Empty array ensures it only runs once on mount

  // Event Handlers
  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSubmitError(null); // Clear error when opening modal
    setShowDetailModal(true);
  };

  const handleCreateWarrantyClaim = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSubmitError(null); // Clear error when opening modal
    setShowWarrantyModal(true);
  };

  // --- UPDATED FUNCTION ---
  const handleWarrantySubmit = async (formData) => {
    // formData from modal: { description, assignTech, technicianIds }
    if (!selectedVehicle || !selectedVehicle.vin) {
      console.error("Selected vehicle or VIN is missing");
      setSubmitError("Cannot create request: Missing vehicle information."); // Display error
      return; // Stop submit
    }

    setSubmitError(null); // Clear old submit error
    // Can add separate loading state for submit if needed
    // setSubmitting(true);

    // Map formData to API payload structure
    const payload = {
      vin: selectedVehicle.vin,               // Get VIN from selected vehicle
      failureDesc: formData.description,      // Map description
      assignsTo: formData.assignTech ? formData.technicianIds : [] // Map technician IDs only when assignTech is true
    };

    console.log("Submitting Warranty Claim:", payload); // For debugging

    try {
      // Call API POST /api/WarrantyClaim
      const response = await request(ApiEnum.CREATE_WARRANTY_CLAIM, payload);

      if (response.success) {
        console.log("Warranty claim created successfully:", response.data);
        setShowWarrantyModal(false); // Close modal on success
        setSelectedVehicle(null);    // Clear selected vehicle
        // Option: Display success message (e.g., using toast)
        // Option: Reload vehicle list if needed (usually not needed after creating claim)
        // fetchVehicles();
      } else {
        console.error("Failed to create warranty claim:", response.message);
        setSubmitError(response.message || 'Unable to create warranty claim. Please try again.'); // Display error
        // Keep modal open so user can see error or retry
      }
    } catch (err) {
      console.error('Error creating warranty claim:', err);
      setSubmitError('A network or system error occurred. Please try again later.'); // Display general error
      // Keep modal open
    } finally {
      // setSubmitting(false); // Stop submit loading state
    }
  };
  // -------------------------

  // Định nghĩa columns cho DataTable
  const columns = [
    {
      key: 'vin',
      label: 'VIN',
      sortable: true
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true
    },
    {
      key: 'model',
      label: 'Model',
      sortable: true
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <Button
            variant="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event (if any)
              handleViewDetail(row);
            }}
          >
            View
          </Button>
          <Button
            variant="success"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateWarrantyClaim(row);
            }}
          >
            Create Warranty Claim
          </Button>
        </div>
      )
    }
  ];

  return (
    <CarListView
      vehicles={vehicles}
      columns={columns}
      loading={loading}
      error={error} // Truyền lỗi load danh sách
      // Truyền lỗi submit riêng nếu muốn hiển thị trong modal
      // submitError={submitError}
      selectedVehicle={selectedVehicle}
      showDetailModal={showDetailModal}
      showWarrantyModal={showWarrantyModal}
      onWarrantySubmit={handleWarrantySubmit} // Truyền handler đã cập nhật
      onCloseDetailModal={() => setShowDetailModal(false)}
      onCloseWarrantyModal={() => {
          setShowWarrantyModal(false);
          setSubmitError(null); // Xóa lỗi submit khi đóng modal thủ công
      }}
    />
  );
};

export default CarListContainer;