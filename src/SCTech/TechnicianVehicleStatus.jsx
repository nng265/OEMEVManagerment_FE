import React, { useState, useEffect } from "react";
import "./TechnicianVehicleStatus.css";
import { request, ApiEnum } from "../services/NetworkUntil";
import TaskModal from "../components/TaskModal";

export default function TechnicianVehicleStatus() {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTask, setFilterTask] = useState("all");

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, filterTask, workOrders]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH);
      console.log("RESPONSE WORK ORDERS:", response);

      if (response.success) {
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setWorkOrders(data);
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
      alert("Không thể tải danh sách công việc. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...workOrders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.warrantyClaim?.vin
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.warrantyClaim?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by task type
    if (filterTask !== "all") {
      filtered = filtered.filter(
        (order) => order.type?.toLowerCase() === filterTask.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };
  const handleViewTask = (order) => {
    const formattedOrder = {
      id: order.workOrderId,
      taskType: order.type?.toLowerCase(),
      issueDescription: order.warrantyClaim?.description || "",
      failureDesc: order.warrantyClaim?.failureDesc || "",
      vehicle: {
        model: order.warrantyClaim?.model || "N/A",
        vin: order.warrantyClaim?.vin || "N/A",
        year: order.warrantyClaim?.year || "N/A",
      },
      images:
        order.warrantyClaim?.attachments?.map(
          (att) => `https://maximum-glorious-ladybird.ngrok-free.app${att.url}`
        ) || [],
      techDescription: order.notes || "",
      parts: order.parts || [], // nếu sau này có parts
    };

    setSelectedOrder(formattedOrder);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleSaveTask = async (updatedData) => {
    try {
      const response = await request(ApiEnum.UPDATE_WORK_ORDER, updatedData);
      if (response.success) {
        alert("Cập nhật thành công!");
        await fetchWorkOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating work order:", error);
      alert("Không thể cập nhật. Vui lòng thử lại.");
    }
  };

  return (
    <div className="technician-container">
      <h1 className="technician-title">Quản lý cập nhật tình trạng xe</h1>

      {/* Search and Filter Bar */}
      <div className="technician-controls">
        <div className="technician-search">
          <input
            type="text"
            placeholder="Tìm kiếm theo VIN hoặc vấn đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="technician-search-input"
          />
          {searchTerm && (
            <button
              className="technician-search-clear"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        <select
          className="technician-filter"
          value={filterTask}
          onChange={(e) => setFilterTask(e.target.value)}
        >
          <option value="all">Tất cả Task</option>
          <option value="inspection">Kiểm tra</option>
          <option value="repair">Sửa chữa</option>
        </select>
      </div>

      {/* Work Orders Table */}
      {loading ? (
        <div className="technician-loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="technician-table-wrapper">
          <table className="technician-table">
            <thead>
              <tr>
                <th>VIN</th>
                <th>Vấn đề</th>
                <th>Task</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="technician-empty">
                    Không có công việc nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.workOrderId}>
                    <td>{order.warrantyClaim?.vin || "N/A"}</td>
                    <td className="technician-issue">
                      {order.warrantyClaim?.description || "Chưa có mô tả"}
                    </td>
                    <td>
                      <span
                        className={`technician-task-badge ${
                          order.type?.toLowerCase() === "inspection"
                            ? "inspection"
                            : "repair"
                        }`}
                      >
                        {order.type === "Inspection" ? "Kiểm tra" : "Sửa chữa"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="technician-view-btn"
                        onClick={() => handleViewTask(order)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {selectedOrder && (
        <TaskModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
