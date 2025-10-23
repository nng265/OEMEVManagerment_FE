// src/features/technician/containers/TechnicianVehicleStatusContainer.jsx
import React, { useState, useEffect } from 'react';
import { request, ApiEnum } from '../../../services/NetworkUntil';
import { TechnicianVehicleStatusView } from '../components/TechnicianVehicleStatusView';
import { formatDate } from '../../../utils/helpers'; // Assuming you have this helper
import { Button } from '../../../components/atoms'; // Import Button for actions

export const TechnicianVehicleStatusContainer = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- UPDATED COLUMNS DEFINITION ---
  const columns = [
    {
      key: 'vin', // Key for sorting (using nested value)
      label: 'VIN', // Changed label
      sortable: true,
      // Render function to access nested data
      render: (_, row) => row.warrantyClaim?.vin || '-' // Access warrantyClaim.vin
    },
    {
       key: 'failureDesc', // Key for sorting (using nested value)
       label: 'Issue', // Changed label to match image
       sortable: true,
       // Render function to access nested data
       render: (_, row) => row.warrantyClaim?.failureDesc || '-' // Access warrantyClaim.failureDesc
    },
    {
      key: 'type', // Correct top-level key for 'Task'
      label: 'Task', // Changed label to match image
      sortable: true
    },
    {
      key: 'status', // Correct top-level key for work order status
      label: 'Status', // Changed label to match image
      sortable: true,
      render: (value) => { // Keep status badge rendering
        // Adjust class generation if needed based on actual status values
        const statusClass = (value || 'unknown').toLowerCase().replace(/ /g, '-').replace(/_/g, '-');
        return (
          <span className={`status-badge status-${statusClass}`}>{value}</span>
        );
      },
    },
    {
      key: 'startDate', // Correct top-level key for date
      label: 'Date', // Changed label to match image
      sortable: true,
      // Format date only (no time)
      render: (value) => formatDate(value, 'vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    },
    { // Actions column
      key: 'actions',
      label: 'Actions', // Changed label to match image
      render: (_, row) => (
        <Button
          variant="primary" // Match 'View Details' button style
          size="small"
          onClick={(e) => {
             e.stopPropagation();
             handleViewWorkOrderDetail(row); // Function to handle viewing details
            }}
        >
          View
        </Button>
      )
    }
  ];
  // ---------------------------------

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH);
      console.log("Work Orders Response:", response); // Debug log
      if (response.success && Array.isArray(response.data)) {
        setWorkOrders(response.data);
      } else {
        setError(response.message || 'Unable to load work order list.');
        setWorkOrders([]);
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
      setError('An error occurred while loading work order list.');
      setWorkOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for the View button
  const handleViewWorkOrderDetail = (order) => {
    console.log("Viewing Work Order:", order);
    setSelectedWorkOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWorkOrder(null);
  };

  return (
    <TechnicianVehicleStatusView
      data={workOrders}
      columns={columns} // Pass the updated columns
      loading={isLoading}
      error={error}
      selectedWorkOrder={selectedWorkOrder}
      showDetailModal={showDetailModal}
      onCloseDetailModal={handleCloseDetailModal}
    />
  );
};

export default TechnicianVehicleStatusContainer;