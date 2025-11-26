import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { WarrantyRecordsSection } from "../../../../components/molecules/WarrantyRecordsSection/WarrantyRecordsSection";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";

export const VehicleDetailModal = ({ show, onClose, vehicle }) => {
  // State lưu danh sách phụ tùng
  const [partList, setPartList] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

  // Gọi API khi Modal mở ra và có vehicle ID
  useEffect(() => {
    // 1. Lấy ID an toàn: kiểm tra cả 'id' và 'vehicleId'
    const vehicleId = vehicle?.id || vehicle?.vehicleId;

    if (show && vehicleId) {
      console.log("Fetching parts for Vehicle ID:", vehicleId); // Log kiểm tra ID

      const fetchVehicleParts = async () => {
        setLoadingParts(true);
        try {
          // 2. Gọi hàm tạo URL từ ApiEnum
          const url = ApiEnum.GET_VEHICLE_PARTS(vehicleId);

          // 3. Gọi request
          const response = await request(url, {}, "GET");

          if (response.success) {
            console.log("Parts loaded:", response.data); // Log kiểm tra dữ liệu trả về
            setPartList(response.data || []);
          } else {
            console.warn("Failed to load parts:", response.message);
            setPartList([]);
          }
        } catch (error) {
          console.error("Error fetching vehicle parts:", error);
          setPartList([]);
        } finally {
          setLoadingParts(false);
        }
      };

      fetchVehicleParts();
    } else {
      // Reset data khi đóng modal
      if (!show) {
        setPartList([]);
      }
    }
  }, [show, vehicle]);

  if (!vehicle) return null;

  // Hàm render nội dung bảng phụ tùng
  const renderPartList = () => {
    if (loadingParts) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <LoadingSpinner size="sm" />
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "8px" }}>
            Loading parts history...
          </p>
        </div>
      );
    }

    if (!partList || partList.length === 0) {
      return (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          No parts replaced for this vehicle.
        </div>
      );
    }

    return (
      <div className="table-responsive">
        {/* Sử dụng class vehicles-table có sẵn để đồng bộ giao diện */}
        <table
          className="table vehicles-table"
          style={{ marginTop: 0, boxShadow: "none" }}
        >
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Part Model
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Part Name
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Serial Number
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Replaced Date
              </th>
            </tr>
          </thead>
          <tbody>
            {partList.map((part, index) => (
              <tr key={part.id || index}>
                <td style={{ padding: "12px 16px" }}>
                  {part.partModel || part.modelCode || "N/A"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {part.partName || "N/A"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: "monospace",
                    color: "#2563eb",
                  }}
                >
                  {part.serialNumber || "N/A"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {part.replacedDate
                    ? new Date(part.replacedDate).toLocaleDateString("en-GB") // Format dd/mm/yyyy
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Vehicle Details"
      size="lg"
      showFooter={false}
    >
      <DetailSection title="Vehicle Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">VIN:</span>
            <span className="value">{vehicle.vin}</span>
          </div>
          <div className="detail-item">
            <span className="label">Model:</span>
            <span className="value">{vehicle.model}</span>
          </div>
          <div className="detail-item">
            <span className="label">Year:</span>
            <span className="value">{vehicle.year}</span>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Customer Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{vehicle.customerName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">
              {vehicle.customerPhoneNunmber || vehicle.customerPhoneNumber}
            </span>
          </div>
        </div>
      </DetailSection>

      {/* Kiểm tra null/undefined cho mảng policy để tránh lỗi crash */}
      <WarrantyRecordsSection
        warrantyRecords={vehicle.policyInformation || []}
      />

      <DetailModalActions onBack={onClose} backLabel="Close" />
    </Modal>
  );
};

VehicleDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.object,
};
