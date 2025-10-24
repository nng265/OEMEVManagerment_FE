// src/features/technician/containers/TechnicianVehicleStatusContainer.jsx
import React, { useState, useEffect } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { TechnicianVehicleStatusView } from "../components/TechnicianVehicleStatusView";
import { formatDate } from "../../../utils/helpers"; // Assuming you have this helper
import { Button } from "../../../components/atoms"; // Import Button for actions
import mockWorkOrders from "../mock/workOrdersMock.json";

export const TechnicianVehicleStatusContainer = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // part to replace/repair
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [serials, setSerials] = useState([]);

  // --- UPDATED COLUMNS DEFINITION ---
  const columns = [
    {
      key: "vin", // Key for sorting (using nested value)
      label: "VIN", // Changed label
      sortable: true,
      // Render function to access nested data
      render: (_, row) => row.warrantyClaim?.vin || "-", // Access warrantyClaim.vin
    },
    {
      key: "failureDesc", // Key for sorting (using nested value)
      label: "Issue", // Changed label to match image
      sortable: true,
      // Render function to access nested data
      render: (_, row) => row.warrantyClaim?.failureDesc || "-", // Access warrantyClaim.failureDesc
    },
    {
      key: "type", // Correct top-level key for 'Task'
      label: "Task", // Changed label to match image
      sortable: true,
    },
    {
      key: "status", // Correct top-level key for work order status
      label: "Status", // Changed label to match image
      sortable: true,
      render: (value) => {
        // Keep status badge rendering
        // Adjust class generation if needed based on actual status values
        const statusClass = (value || "unknown")
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/_/g, "-");
        return (
          <span className={`status-badge status-${statusClass}`}>{value}</span>
        );
      },
    },
    {
      key: "startDate", // Correct top-level key for date
      label: "Date", // Changed label to match image
      sortable: true,
      // Format date only (no time)
      render: (value) =>
        formatDate(value, "vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      // Actions column
      key: "actions",
      label: "Actions", // Changed label to match image
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
      ),
    },
  ];

  useEffect(() => {
    fetchWorkOrders();
    fetchCategories();
  }, []);

  // const fetchWorkOrders = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH);
  //     console.log("Work Orders Response:", response); // Debug log
  //     if (response.success && Array.isArray(response.data)) {
  //       setWorkOrders(response.data);
  //     } else {
  //       setError(response.message || "Unable to load work order list.");
  //       setWorkOrders([]);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching work orders:", err);
  //     setError("An error occurred while loading work order list.");
  //     setWorkOrders([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Dùng mock data thay vì gọi API
      await new Promise((resolve) => setTimeout(resolve, 300)); // giả delay 300ms
      console.log("Mock Work Orders:", mockWorkOrders);
      setWorkOrders(mockWorkOrders);
    } catch (err) {
      console.error("Error loading mock work orders:", err);
      setError("An error occurred while loading mock data.");
    } finally {
      setIsLoading(false);
    }
  };

  //  Lấy danh mục linh kiện
  const fetchCategories = async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORY);
      console.log("Category response:", response);
      // normalize possible shapes
      const cats = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Lấy danh sách model theo category
  const fetchModels = async (categoryName) => {
    try {
      if (!categoryName) {
        setModels([]);
        return;
      }
      const response = await request(ApiEnum.GET_PART_MODEL, {
        category: categoryName,
      });
      console.log("Model response:", response);
      const mods = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setModels(mods);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  // Lấy danh sách serial theo vin và model
  const fetchSerial = async (vin, modelName) => {
    try {
      if (!vin || !modelName) {
        setSerials([]);
        return;
      }

      console.log("fetchSerial called with:", { vin, modelName });

      const response = await request(ApiEnum.GET_PART_SERIAL, {
        vin: vin,
        model: modelName,
      });

      console.log("Serial response:", response);
      const sers = Array.isArray(response)
        ? response
        : response?.success && Array.isArray(response.data)
        ? response.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setSerials(sers);
    } catch (error) {
      console.error("Error fetching serials:", error);
      setSerials([]);
    }
  };

  //  Hàm upload hình ảnh kèm mô tả tiếng Việt từng bước
  const uploadImages = async (claimId, files = []) => {
    if (!claimId || !files.length) return [];

    try {
      //  Tạo formData để chứa danh sách file gửi lên server
      const formData = new FormData();

      //  Mỗi file được thêm vào formData với key là "files"
      files.forEach((f) => formData.append("files", f));

      // Log để kiểm tra dữ liệu formData trước khi gửi
      for (let [key, value] of formData.entries()) {
        console.log(`Key: ${key}, Value: ${value.name || value}`);
      }

      // Gửi request lên API /images/multi/:claimId
      const res = await request(ApiEnum.UPLOAD_IMAGE, {
        params: { claimId },
        formData, // Gửi formData dưới dạng multipart/form-data
      });

      // Chuẩn hóa dữ liệu trả về
      const uploaded = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      console.log(" Upload thành công:", uploaded);
      return uploaded;
    } catch (err) {
      console.error(" Lỗi khi upload hình:", err);
      return [];
    }
  };

  // Submit inspection result
  const submitInspection = async (claimId, payload = {}) => {
    if (!claimId) throw new Error("Missing claimId");
    const res = await request(ApiEnum.WARRANTY_INSPECTION, {
      params: { claimId },
      ...payload,
    });
    return res;
  };

  // Submit repair info
  const submitRepair = async (claimId, payload = {}) => {
    if (!claimId) throw new Error("Missing claimId");
    const res = await request(ApiEnum.WARRANTY_REPAIR, {
      params: { claimId },
      ...payload,
    });
    return res;
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
      categories={categories} //Lưu dữ liệu thực tế để React render ra giao diện
      models={models}
      serials={serials}
      // pass helper functions so modal can load models/serials on demand
      fetchCategories={fetchCategories} // Gọi API, lấy dữ liệu và cập nhật vào state
      fetchModels={fetchModels}
      fetchSerial={fetchSerial}
      // API helpers passed to modal so network calls live in container
      uploadImages={uploadImages}
      submitInspection={submitInspection}
      submitRepair={submitRepair}
    />
  );
};

export default TechnicianVehicleStatusContainer;
