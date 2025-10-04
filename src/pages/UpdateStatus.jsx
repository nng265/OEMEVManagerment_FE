import React, { useState, useEffect } from "react";
import "./UpdateStatus.css";

export default function UpdateStatus() {
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [mode, setMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // --- Load dữ liệu ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const claimsRes = await fetch("http://localhost:3001/claims");
        const claimsData = await claimsRes.json();
        setClaims(claimsData);

        const vehiclesRes = await fetch("http://localhost:3001/vehicles");
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Lỗi load data:", err);
      }
    };
    fetchData();
  }, []);

  // --- Mở modal ---
  const openModal = (claim, type) => {
    const vehicle = vehicles.find((v) => v.vin === claim.vin) || {};
    setSelectedClaim({ ...claim, vehicle });
    setMode(type);
  };

  const closeModal = () => {
    setSelectedClaim(null);
    setMode(null);
  };

  // --- Save & Gửi cho Staff ---
  const onSave = async (payload, actionType) => {
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const updatedClaim = {
        ...selectedClaim,
        description: payload.get("description") || selectedClaim.description,
      };

      // Nếu bấm “Gửi Staff duyệt” thì đổi trạng thái
      if (actionType === "send_staff") {
        updatedClaim.status = "waiting_staff";
      } else {
        // Nếu chỉ lưu, không đổi trạng thái (hoặc giữ “tech_in_progress”)
        updatedClaim.status = "tech_in_progress";
      }

      await fetch(`http://localhost:3001/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClaim),
      });

      setClaims((prev) =>
        prev.map((c) => (c.id === selectedClaim.id ? updatedClaim : c))
      );

      closeModal();
      alert(actionType === "send_staff" ? "Đã gửi Staff duyệt!" : "Đã lưu!");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Lọc dữ liệu ---
  const filteredClaims = claims.filter((c) => {
    const vehicle = vehicles.find((v) => v.vin === c.vin) || {};
    const searchString =
      `${c.vin} ${vehicle.model} ${c.description}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all"
        ? true
        : c.jobType?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="update-container">
      <h2>Danh sách công việc được phân công</h2>

      <div className="controls-bar">
        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo VIN / mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="reset-btn" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>

        {/* Filter */}
        <select
          className="filter-dropdown"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại công việc</option>
          <option value="bảo hành">Bảo hành</option>
          <option value="sửa chữa">Sửa chữa</option>
          <option value="khác">Khác</option>
        </select>
      </div>

      {/* Bảng */}
      <table className="custom-table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Mẫu xe</th>
            <th>Loại công việc</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.map((c) => (
            <tr key={c.id}>
              <td>{c.vin}</td>
              <td>{vehicles.find((v) => v.vin === c.vin)?.model || "-"}</td>
              <td>{c.jobType || "-"}</td>
              <td>{c.description || "(Chưa có mô tả)"}</td>
              <td>
                <button onClick={() => openModal(c, "view")}>Xem</button>
                <button onClick={() => openModal(c, "update")}>Cập nhật</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedClaim && (
        <ClaimModal
          claim={selectedClaim}
          mode={mode}
          onClose={closeModal}
          onSave={onSave}
          uploading={submitting}
        />
      )}
    </div>
  );
}

// ================= Claim Modal =================
function ClaimModal({ claim, mode, onClose, onSave, uploading }) {
  const [description, setDescription] = useState(claim.description || "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setDescription(claim.description || "");
    setSelectedFiles([]);
  }, [claim]);

  useEffect(() => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (actionType) => {
    const fd = new FormData();
    fd.append("description", description);
    selectedFiles.forEach((f) => fd.append("attachments", f));
    await onSave(fd, actionType);
  };

  return (
    <>
      <div className="claim-modal__overlay">
        <div className="claim-modal__container">
          <div className="claim-modal__header">
            <h5>{mode === "view" ? "Thông tin" : "Cập nhật tình trạng xe"}</h5>
            <button className="claim-modal__close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="claim-modal__body">
            {mode === "view" ? (
              <div className="claim-modal__grid">
                <section className="claim-modal__section">
                  <h5>Thông tin xe</h5>
                  <div className="claim-modal__row">
                    <span>VIN:</span>
                    <span>{claim.vehicle?.vin || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Mẫu xe:</span>
                    <span>{claim.vehicle?.model || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Ngày mua:</span>
                    <span>{claim.vehicle?.purchaseDate || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Tình trạng:</span>
                    <span>{claim.vehicle?.status || "-"}</span>
                  </div>
                </section>

                <section className="claim-modal__section">
                  <h5>Chi tiết công việc</h5>
                  <div className="claim-modal__row">
                    <span>Bị hư hỏng:</span>
                    <span>{claim.title || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Loại công việc:</span>
                    <span>{claim.jobType || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Ngày phân công:</span>
                    <span>{claim.assignedDate || "-"}</span>
                  </div>
                  <div className="claim-modal__row">
                    <span>Mô tả:</span>
                    <span>{claim.description || "(Chưa có mô tả)"}</span>
                  </div>
                </section>
              </div>
            ) : (
              <>
                <label>Mô tả kiểm tra</label>
                <textarea
                  className="claim-modal__textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  type="file"
                  className="claim-modal__file"
                  multiple
                  onChange={handleFileChange}
                />
                {previewUrls.length > 0 && (
                  <div className="claim-modal__preview-list">
                    {previewUrls.map((u, i) => (
                      <div key={i} className="claim-modal__preview-item">
                        <img
                          src={u}
                          alt={`preview-${i}`}
                          onClick={() => setPreviewImage(u)}
                        />
                        <button
                          className="claim-modal__remove"
                          onClick={() => removeSelectedFile(i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {previewImage && (
            <div
              className="image-preview-overlay"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="image-preview-content"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={previewImage} alt="Preview" />
                <button
                  className="image-preview-close"
                  onClick={() => setPreviewImage(null)}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="claim-modal__footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Đóng
            </button>
            {mode === "update" && (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSubmit("save_only")}
                  disabled={uploading}
                >
                  {uploading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubmit("send_staff")}
                  disabled={uploading}
                >
                  {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
