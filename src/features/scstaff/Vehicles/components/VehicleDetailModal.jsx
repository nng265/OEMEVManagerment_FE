import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { WarrantyRecordsSection } from "../../../../components/molecules/WarrantyRecordsSection/WarrantyRecordsSection";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";

export const VehicleDetailModal = ({ show, onClose, vehicle }) => {
  const [partList, setPartList] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

  useEffect(() => {
    if (!show || !vehicle) return;

    // --- LOGIC MỚI ---
    // 1. Ưu tiên kiểm tra xem trong object vehicle đã có sẵn installedParts chưa
    // (Dựa vào JSON bạn gửi, API List Vehicle đã trả về cục này rồi)
    if (vehicle.installedParts && Array.isArray(vehicle.installedParts)) {
      console.log(
        "Using existing parts from vehicle prop:",
        vehicle.installedParts
      );
      setPartList(vehicle.installedParts);
      setLoadingParts(false);
      return;
    }

    // 2. Nếu trong props không có, mới đi gọi API (Fallback)
    const vehicleId = vehicle?.id || vehicle?.vehicleId;

    if (vehicleId) {
      console.log("Fetching parts for Vehicle ID (Fallback):", vehicleId);
      const fetchVehicleParts = async () => {
        setLoadingParts(true);
        try {
          const url = ApiEnum.GET_VEHICLE_PARTS(vehicleId);
          const response = await request(url, {}, "GET");

          if (response.isSuccess || response.success) {
            const listData =
              response.data?.installedParts || response.data || [];
            setPartList(listData);
          } else {
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
      setPartList([]);
    }
  }, [show, vehicle]);

  if (!vehicle) return null;

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
        <table
          className="table vehicles-table"
          style={{ marginTop: 0, boxShadow: "none" }}
        >
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Model
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Serial Number
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Installed Date
              </th>
              <th style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {partList.map((part, index) => (
              <tr key={index}>
                <td style={{ padding: "12px 16px", fontWeight: "500" }}>
                  {part.model || part.partName || "N/A"}
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
                  {part.installedAt
                    ? new Date(part.installedAt).toLocaleDateString("en-GB")
                    : part.replacedDate
                    ? new Date(part.replacedDate).toLocaleDateString("en-GB")
                    : "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        part.status === "OnVehicle" ? "#def7ec" : "#f1f5f9",
                      color:
                        part.status === "OnVehicle" ? "#03543f" : "#475569",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {part.status || "Unknown"}
                  </span>
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

      <WarrantyRecordsSection
        warrantyRecords={vehicle.policyInformation || []}
      />

      <DetailSection title="Part Installed">{renderPartList()}</DetailSection>

      <DetailModalActions onBack={onClose} backLabel="Close" />
    </Modal>
  );
};

VehicleDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.object,
};
