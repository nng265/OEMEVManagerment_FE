// src/features/technician/containers/TechnicianVehicleStatusContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { request, uploadFiles, ApiEnum } from "../../../services/NetworkUntil";
import { TechnicianVehicleStatusView } from "../components/TechnicianVehicleStatusView";
import { formatDate, normalizePagedResult } from "../../../services/helpers"; // Assuming you have this helper
import { Button } from "../../../components/atoms"; // Import Button for actions

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
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // --- UPDATED COLUMNS DEFINITION ---
  const columns = [
    {
      key: "vin",
      label: "VIN",
      sortable: true,
      render: (_, row) => row.vin || "-",
    },
    {
      key: "target",
      label: "Type",
      sortable: true,
      render: (_, row) => {
        if (row.target === "Warranty") {
          const desc =
            row.warrantyClaim?.failureDesc ||
            row.warrantyClaim?.description ||
            "";
          return `Warranty${desc ? ": " + desc : ""}`;
        }
        if (row.target === "Campaign") {
          const title = row.campaign?.title || "";
          return `Campaign${title ? ": " + title : ""}`;
        }
        return row.target || "-";
      },
    },
    {
      key: "type",
      label: "Task",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
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
      key: "startDate",
      label: "Date",
      sortable: true,
      render: (value) =>
        formatDate(value, "vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleViewWorkOrderDetail(row);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORIES);
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
  }, []);

  const fetchWorkOrders = useCallback(async (pageNumber = 0, pageSize) => {
    const effectivePageSize =
      typeof pageSize === "number" ? pageSize : paginationRef.current.pageSize;
    setIsLoading(true);
    setError(null);

    try {
      const response = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH, {
        Page: pageNumber,
        Size: effectivePageSize,
      });

      const { success, items, totalRecords, page, size, message } =
        normalizePagedResult(response, []);

      if (success) {
        setWorkOrders(items);
        setPagination({
          pageNumber: typeof page === "number" ? page : pageNumber,
          pageSize:
            typeof size === "number" && size > 0 ? size : effectivePageSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } else {
        setWorkOrders([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber,
          pageSize: effectivePageSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load work order list.");
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
      const message =
        err?.responseData?.message ||
        err?.message ||
        "An error occurred while loading work order list.";
      setWorkOrders([]);
      setPagination((prev) => ({
        ...prev,
        pageNumber,
        pageSize: effectivePageSize,
        totalRecords: 0,
      }));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchWorkOrders(0, paginationRef.current.pageSize);
    fetchCategories();
  }, [fetchWorkOrders, fetchCategories]);

  // const fetchWorkOrders = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // ✅ Dùng mock data thay vì gọi API
  //     await new Promise((resolve) => setTimeout(resolve, 300)); // giả delay 300ms
  //     console.log("Mock Work Orders:", mockWorkOrders);
  //     setWorkOrders(mockWorkOrders);
  //   } catch (err) {
  //     console.error("Error loading mock work orders:", err);
  //     setError("An error occurred while loading mock data.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Lấy danh sách model theo category
  const fetchModels = async (categoryName) => {
    try {
      if (!categoryName) {
        setModels([]);
        return [];
      }
      const response = await request(ApiEnum.GET_PART_MODELS, {
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
      return mods; // Return data để modal có thể dùng
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  };

  // Lấy danh sách serial theo vin và model
  const fetchSerial = async (vin, modelName) => {
    try {
      if (!vin || !modelName) {
        setSerials([]);
        return [];
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
      return sers; // Return data để modal có thể dùng
    } catch (error) {
      console.error("Error fetching serials:", error);
      setSerials([]);
      return [];
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
      const res = await uploadFiles(ApiEnum.UPLOAD_IMAGE, {
        params: { claimId }, // claimId sẽ thay thế :claimId trong path
        files: files, // uploadFiles sẽ tự động xử lý files array
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
    const { pageNumber, pageSize } = paginationRef.current;
    await fetchWorkOrders(pageNumber, pageSize);
    return res;
  };

  // Submit repair info
  const submitRepair = async (claimId, payload = {}) => {
    if (!claimId) throw new Error("Missing claimId");
    const res = await request(ApiEnum.WARRANTY_REPAIR, {
      params: { claimId },
      ...payload,
    });
    const { pageNumber, pageSize } = paginationRef.current;
    await fetchWorkOrders(pageNumber, pageSize);
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

  const handlePageChange = useCallback(
    (page, size) => {
      fetchWorkOrders(page, size);
    },
    [fetchWorkOrders]
  );

  return (
    <TechnicianVehicleStatusView
      data={workOrders}
      columns={columns} // Pass the updated columns
      loading={isLoading}
      error={error}
      pagination={pagination}
      onPageChange={handlePageChange}
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
