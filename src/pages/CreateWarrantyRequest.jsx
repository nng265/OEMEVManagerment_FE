// src/pages/CreateWarrantyRequest.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getVehicleByVin, createClaim } from "../services/NetworkUntil";
import InputText from "../components/InputText";
import Button from "../components/Button";
import DropdownList from "../components/DropdownList";
import "./CreateWarrantyRequest.css";

export default function CreateWarrantyRequest({ vinProp }) {
  const location = useLocation();
  const queryVin = new URLSearchParams(location.search).get("vin") || "";
  const initialVin = vinProp || queryVin || "";

  const [vin, setVin] = useState(initialVin);
  const [vehicle, setVehicle] = useState(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("New");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // load thông tin xe nếu có VIN
  useEffect(() => {
    setVin(initialVin);
    if (initialVin) {
      (async () => {
        try {
          const v = await getVehicleByVin(initialVin);
          setVehicle(v);
        } catch (err) {
          console.error(err);
          setVehicle(null);
        }
      })();
    } else {
      setVehicle(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVin]);

  const handleSearch = async () => {
    if (!vin.trim()) {
      setMessage("⚠️ Vui lòng nhập VIN trước khi tìm");
      setVehicle(null);
      return;
    }
    try {
      const v = await getVehicleByVin(vin.trim());
      if (v) {
        setVehicle(v);
        setMessage("");
      } else {
        setVehicle(null);
        setMessage("❌ Không tìm thấy xe với VIN này");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tìm xe");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle) {
      setMessage("⚠️ Vui lòng tìm và chọn xe trước khi tạo hồ sơ");
      return;
    }
    setMessage("");
    try {
      const attachments = file ? [{ name: file.name }] : [];
      const claimData = {
        vin: vin.trim(),
        date: new Date().toISOString(),
        description: description.trim(),
        attachments,
        status: status || "New",
      };
      await createClaim(claimData);
      setMessage("✅ Tạo yêu cầu bảo hành thành công!");
      // 👉 Sau khi thành công thì chuyển sang phân công kỹ thuật viên
      setTimeout(() => {
        navigate("/phan-cong", { state: { vin } });
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage("❌ Tạo hồ sơ thất bại. Thử lại.");
    }
  };

  return (
    <div className="create-claim-container">
      <h3>📌 Tạo yêu cầu bảo hành</h3>

      <form onSubmit={handleSubmit}>
        <div className="vin-search">
          <InputText
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Nhập VIN"
            readOnly={!!vinProp || !!queryVin}
          />
          {/* chỉ cho tìm kiếm khi không có VIN truyền sẵn */}
          {!(vinProp || queryVin) && (
            <Button type="button" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          )}
        </div>

        {vehicle && (
          <div className="vehicle-info">
            <p><strong>Mẫu xe:</strong> {vehicle.model}</p>
            <p><strong>Ngày mua:</strong> {vehicle.purchaseDate}</p>
            <p><strong>Trạng thái:</strong> {vehicle.status}</p>
          </div>
        )}

        <div className="mb-2">
          <label>Mô tả lỗi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Mô tả chi tiết lỗi..."
            required
          />
        </div>

        <div className="mb-2">
          <label>Trạng thái</label>
          <DropdownList
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={["New", "Pending", "Resolved"]}
          />
        </div>

        <div className="mb-3">
          <label>Upload ảnh / tài liệu</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          {file && <small>Chọn file: {file.name}</small>}
        </div>

        {message && (
          <div
            className={
              message.includes("thành công")
                ? "success-message"
                : "error-message"
            }
          >
            {message}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit">Lưu hồ sơ</Button>
          <Button type="button" onClick={() => navigate("/dashboard")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
