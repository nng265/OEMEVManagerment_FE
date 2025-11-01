// src/features/car/containers/CarListContainer.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CarListView } from '../components/CarListView';
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { Button } from '../../../../components/atoms/Button/Button';
import { normalizePagedResult } from '../../../../services/helpers';

export const CarListContainer = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ✅ Pagination từ BE (page bắt đầu = 0, size = 20)
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // --- Fetch dữ liệu từ BE ---
  const fetchVehicles = useCallback(async (pageNumber = 0, pageSize) => {
    const effectivePageSize =
      typeof pageSize === 'number' ? pageSize : paginationRef.current.pageSize;

    try {
      setLoading(true);
      setError(null);
      setSubmitError(null);

      const response = await request(ApiEnum.GET_VEHICLES, {
        Page: pageNumber,
        Size: effectivePageSize,
      });

      const {
        success,
        items,
        totalRecords,
        page,
        size,
        message,
      } = normalizePagedResult(response, []);

      if (success) {
        setVehicles(items);
        setPagination({
          pageNumber: typeof page === 'number' ? page : pageNumber,
          pageSize:
            typeof size === 'number' && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === 'number' ? totalRecords : items.length,
        });
      } else {
        setVehicles([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || 'Unable to load vehicle list.');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      const message =
        err?.responseData?.message ||
        err?.message ||
        'An error occurred while loading the vehicle list.';
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
      fetchVehicles(page, size);
    },
    [fetchVehicles]
  );

  const handleWarrantySubmit = async (formData) => {
    if (!selectedVehicle || !selectedVehicle.vin) {
      setSubmitError('Missing vehicle information.');
      return;
    }

    const payload = {
      vin: selectedVehicle.vin,
      failureDesc: formData.description,
      assignsTo: formData.assignTech ? formData.technicianIds : [],
    };

    try {
      const response = await request(ApiEnum.CREATE_WARRANTY_CLAIM, payload);
      if (response.success) {
        console.log('Warranty claim created successfully:', response.data);
        setShowWarrantyModal(false);
        setSelectedVehicle(null);
      } else {
        setSubmitError(response.message || 'Unable to create warranty claim.');
      }
    } catch (err) {
      console.error('Error creating warranty claim:', err);
      setSubmitError('A system error occurred. Please try again later.');
    }
  };

  // --- Cấu hình DataTable ---
  const columns = [
    { key: 'vin', label: 'VIN' },
    { key: 'customerName', label: 'Customer' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year', sortType: 'number' },
    {
      className: 'title',
      key: 'actions',
      label: ' Actions',
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
            variant="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateWarrantyClaim(row);
            }}
          >
            Create Warranty Claim
          </Button>
        </div>
      ),
    },
  ];

  return (
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
      }}
      pagination={pagination}
      // ✅ Gọi lại API khi đổi trang hoặc page size
      onPageChange={handlePageChange}
    />
  );
};

export default CarListContainer;
