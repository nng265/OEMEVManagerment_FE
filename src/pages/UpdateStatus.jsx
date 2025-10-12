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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, vehiclesRes] = await Promise.all([
          fetch("http://localhost:3001/claims"),
          fetch("http://localhost:3001/vehicles"),
        ]);
        setClaims(await claimsRes.json());
        setVehicles(await vehiclesRes.json());
      } catch (err) {
        console.error("Lỗi load data:", err);
      }
    };
    fetchData();
  }, []);

  const openModal = (claim, type) => {
    const vehicle = vehicles.find((v) => v.vin === claim.vin) || {};
    setSelectedClaim({ ...claim, vehicle });
    setMode(type);
  };

  const closeModal = () => {
    setSelectedClaim(null);
    setMode(null);
  };

  const onSave = async (payload, actionType) => {
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const updatedClaim = {
        ...selectedClaim,
        description: payload.description ?? selectedClaim.description,
        attachments: payload.attachments ?? selectedClaim.attachments ?? [],
        parts: payload.parts ?? selectedClaim.parts ?? [],
      };

      // ✅ Cập nhật trạng thái đúng quy trình
      // ✅ Cập nhật trạng thái đúng quy trình chuẩn hóa
      switch (actionType) {
        case "send_staff":
          updatedClaim.status = "waiting_staff";
          break;

        case "approve_by_staff":
          updatedClaim.status = "approved_by_staff";
          break;

        case "approve_by_manufacturer":
          updatedClaim.status = "approved_by_manufacturer";
          break;

        case "complete_repair":
          updatedClaim.status = "completed";
          break;

        case "reject":
          updatedClaim.status = "rejected";
          break;

        default:
          // chỉ lưu nội dung mà không đổi trạng thái
          updatedClaim.status = selectedClaim.status;
          break;
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

      const messageMap = {
        send_staff: "Đã gửi Staff duyệt!",
        approve_by_staff: "Staff đã duyệt gửi hãng!",
        complete_repair: "  Hoàn tất sửa chữa!",
        default: "Lưu thành công!",
      };

      alert(messageMap[actionType] || messageMap.default);
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* 🔎 Thanh tìm kiếm + lọc */}
      <div className="update-controls-bar">
        <div className="update-search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo VIN / mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="update-reset-btn"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        <select
          className="update-filter-dropdown"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại công việc</option>
          <option value="sửa chữa">Sửa chữa</option>
          <option value="kiểm tra">Kiểm tra</option>
        </select>
      </div>

      {/* 📋 Bảng danh sách */}
      <table className="update-table">
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

                {c.status !== "completed" && c.status !== "rejected" && (
                  <>
                    {c.status === "approved_by_manufacturer" ? (
                      <button onClick={() => openModal(c, "serial")}>
                        {c.jobType?.toLowerCase() === "kiểm tra"
                          ? "Hoàn tất"
                          : "Nhập Serial"}
                      </button>
                    ) : (
                      <button onClick={() => openModal(c, "update")}>
                        Cập nhật
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

// =============================================
// 🧱 Modal xử lý cập nhật chi tiết
// =============================================
function ClaimModal({ claim, mode, onClose, onSave, uploading }) {
  const [techDescription, setTechDescription] = useState(
    claim.techDescription || ""
  );
  const [attachments, setAttachments] = useState(claim.attachments || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [parts, setParts] = useState(
    claim.parts || [
      { type: "", category: "", model: "", quantity: 1, serials: [""] },
    ]
  );

  const isApproved = claim.status === "approved_by_manufacturer";
  const isRepairJob = claim.jobType?.toLowerCase() === "sửa chữa";
  const allSerialsFilled =
    claim.jobType?.toLowerCase() === "kiểm tra"
      ? true
      : parts.every((p) => p.serials && p.serials[0]?.trim() !== "");

  // Preview ảnh mới
  useEffect(() => {
    if (!newFiles.length) return setPreviewUrls([]);
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);
  };

  const handlePartChange = (index, field, value) => {
    const updated = [...parts];
    updated[index][field] = value;
    setParts(updated);
  };

  const handleQuantity = (index, change) => {
    setParts((prev) => {
      const updated = [...prev];
      const newQty = (prev[index].quantity || 1) + change; // dùng prev[index].quantity

      if (newQty > 0) {
        updated[index] = { ...updated[index], quantity: newQty };
        return updated;
      } else {
        updated.splice(index, 1);
        if (updated.length === 0) {
          return [
            { type: "", category: "", model: "", quantity: 1, serials: [""] },
          ];
        }
        return updated;
      }
    });
  };
  // Ví dụ khi submit mô tả lỗi
  const handleSaveDescription = async (claimId, techDescription) => {
    try {
      await fetch(`http://localhost:3001/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techDescription }), // lưu vào techDescription
      });
      // cập nhật state nếu muốn realtime
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, techDescription } : c))
      );
    } catch (err) {
      console.error("Lỗi lưu mô tả:", err);
    }
  };

  const handleSerialChange = (i, val) => {
    setParts((prev) => {
      const updated = [...prev];
      updated[i].serials = [val];
      return updated;
    });
  };

  const addPartRow = () => {
    setParts([
      ...parts,
      { type: "", category: "", model: "", quantity: 1, serials: [""] },
    ]);
  };

  const handleSubmit = async (actionType) => {
    // Lưu mô tả lỗi trước
    await fetch(`http://localhost:3001/claims/${claim.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ techDescription }),
    });

    const newFileUrls = newFiles.map((f) => URL.createObjectURL(f));
    const payload = {
      techDescription,
      attachments: [...attachments, ...newFileUrls],
      parts,
    };

    await onSave(payload, actionType);
    setNewFiles([]);
  };

  const allPartsValid =
    parts.length > 0 &&
    parts.every((p) => p.type && p.category && p.model && p.quantity > 0);

  const isValidForSend = techDescription.trim().length > 0 && allPartsValid;

  const removeOldAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  const removeNewFile = (index) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="update-modal__overlay">
      <div className="update-modal__container">
        <div className="update-modal__header">
          <h5>{mode === "view" ? "Thông tin" : "Cập nhật tình trạng xe"}</h5>
          <button className="update-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="update-modal__body">
          {mode === "view" ? (
            <div className="update-modal__two-column">
              <section className="update-modal__section">
                <h5>Thông tin xe</h5>
                <div className="update-modal__row">
                  <span>VIN:</span>
                  <span>{claim.vehicle?.vin || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Model:</span>
                  <span>{claim.vehicle?.model || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Ngày mua:</span>
                  <span>{claim.vehicle?.purchaseDate || "-"}</span>
                </div>
              </section>

              <section className="update-modal__section">
                <h5>Chi tiết công việc</h5>
                <div className="update-modal__row">
                  <span>Loại công việc:</span>
                  <span>{claim.jobType || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Ngày phân công:</span>
                  <span>{claim.assignedDate || "-"}</span>
                </div>
                <div className="update-modal__row description-row">
                  <span>Mô tả khách hàng:</span>
                  <div className="description-content">
                    {claim.description || "-"}
                  </div>
                </div>

                {/* TODO - thanh cuộn nếu nội dung quá dài*/}
              </section>
            </div>
          ) : mode === "serial" ? (
            <>
              <section className="update-modal__section info-box">
                <h5>Thông tin xe</h5>
                <div className="update-modal__row">
                  <span>VIN:</span>
                  <span>{claim.vehicle?.vin || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Model:</span>
                  <span>{claim.vehicle?.model || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Loại công việc:</span>
                  <span>{claim.jobType || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Ngày phân công:</span>
                  <span>{claim.assignedDate || "-"}</span>
                </div>
              </section>

              {!isApproved && (
                <section className="update-modal__section">
                  <div className="update-modal__label">
                    Mô tả kỹ thuật / mã lỗi
                  </div>
                  <textarea
                    className="update-modal__textarea"
                    rows={4}
                    value={techDescription}
                    onChange={(e) => setTechDescription(e.target.value)}
                  />
                </section>
              )}
              {/* Bảng linh kiện + Serial */}
              <div className="update-modal__section update-parts-section">
                <table className="update-parts-table">
                  <thead>
                    <tr>
                      <th>Loại công việc</th>
                      <th>Tên linh kiện</th>
                      <th>Mẫu</th>
                      <th>Số lượng</th>
                      {isRepairJob && <th>Serial</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p, i) => (
                      <tr key={i}>
                        <td>{p.type}</td>
                        <td>{p.category}</td>
                        <td>{p.model}</td>
                        <td>{p.quantity}</td>
                        {isRepairJob && (
                          <td>
                            <input
                              type="text"
                              className="update-serial-input"
                              placeholder="Số serial"
                              value={p.serials?.[0] || ""}
                              onChange={(e) =>
                                handleSerialChange(i, e.target.value)
                              }
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="update-modal__footer">
                <button
                  className="update-btn update-btn-secondary"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Đóng
                </button>
                <button
                  className={`update-complete-btn ${
                    claim.jobType?.toLowerCase() === "kiểm tra"
                      ? "check-btn"
                      : ""
                  }`}
                  onClick={() => handleSubmit("complete_repair")}
                  disabled={!allSerialsFilled || uploading}
                >
                  {uploading
                    ? "Đang hoàn tất..."
                    : claim.jobType?.toLowerCase() === "kiểm tra"
                    ? "Hoàn tất kiểm tra"
                    : "Hoàn tất sửa chữa"}
                </button>
              </div>
            </>
          ) : (
            // mode update / view cũ

            <>
              {/* ===== UPDATE MODE ===== */}
              <section className="update-modal__section info-box">
                <h5>Thông tin xe</h5>
                <div className="update-modal__row">
                  <span>VIN:</span>
                  <span>{claim.vehicle?.vin || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Model:</span>
                  <span>{claim.vehicle?.model || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Loại công việc:</span>
                  <span>{claim.jobType || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Ngày phân công:</span>
                  <span>{claim.assignedDate || "-"}</span>
                </div>
              </section>

              {/* 📝 Ẩn mô tả và ảnh khi đã approved */}
              {!isApproved && (
                <>
                  <div className="update-modal__section">
                    <div className="update-modal__label">Mô tả kiểm tra</div>
                    <textarea
                      className="update-modal__textarea"
                      rows={4}
                      value={techDescription}
                      onChange={(e) => setTechDescription(e.target.value)}
                    />
                  </div>
                  {/* Ảnh đã lưu */}
                  <div className="update-modal__section">
                    <div className="update-modal__label">Ảnh đã lưu</div>
                    <div className="update-modal__content">
                      {attachments.length > 0 ? (
                        <div className="image-preview-grid">
                          {attachments.map((url, i) => (
                            <div key={i} className="image-thumb">
                              <img
                                src={url}
                                alt={`old-${i}`}
                                onClick={() => setZoomedImage(url)}
                              />
                              <button
                                className="remove-btn"
                                onClick={() => removeOldAttachment(i)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="update-modal__empty-text">
                          (Chưa có ảnh nào)
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Thêm ảnh mới */}

                  <div className="update-modal__section">
                    <div className="update-modal__label">Thêm file mới</div>
                    <label className="custom-upload-btn">
                      + Thêm file
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>
                    {previewUrls.length > 0 && (
                      <div className="image-preview-grid">
                        {previewUrls.map((u, i) => (
                          <div key={i} className="image-thumb">
                            <img
                              src={u}
                              alt={`preview-${i}`}
                              onClick={() => setZoomedImage(u)}
                            />
                            <button
                              className="remove-btn"
                              onClick={() => removeNewFile(i)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 🧰 Phần linh kiện */}
              <div className="update-modal__section update-parts-section">
                <div className="update-modal__label">
                  Linh kiện sửa chữa / thay thế
                </div>
                <div className="update-parts-content">
                  {parts.map((p, i) => (
                    <div key={i} className="update-parts-row">
                      {!isApproved ? (
                        <>
                          <select
                            value={p.type}
                            onChange={(e) =>
                              handlePartChange(i, "type", e.target.value)
                            }
                          >
                            <option value="">Sửa chữa/Thay thế</option>
                            <option value="sửa chữa">Sửa chữa</option>
                            <option value="thay thế">Thay thế</option>
                          </select>
                          <select
                            value={p.category}
                            onChange={(e) =>
                              handlePartChange(i, "category", e.target.value)
                            }
                          >
                            <option value="">Category</option>
                            <option value="Gương">Gương</option>
                            <option value="Đèn">Đèn</option>
                            <option value="Pin">Pin</option>
                            <option value="Bánh xe">Bánh xe</option>
                          </select>
                          <select
                            value={p.model}
                            onChange={(e) =>
                              handlePartChange(i, "model", e.target.value)
                            }
                          >
                            <option value="">Model</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                          <div className="update-quantity-control">
                            <button
                              type="button"
                              onClick={() => handleQuantity(i, 1)}
                            >
                              ▲
                            </button>
                            <span>{p.quantity}</span>

                            <button
                              type="button"
                              onClick={() => handleQuantity(i, -1)}
                            >
                              ▼
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="part-info">{p.type}</span>
                          <span className="part-info">{p.category}</span>
                          <span className="part-info">{p.model}</span>
                          <span className="part-info">{p.quantity}</span>
                          {claim.jobType?.toLowerCase() === "sửa chữa" && (
                            <input
                              type="text"
                              className="update-serial-input"
                              placeholder="Số serial"
                              value={p.serials?.[0] || ""}
                              onChange={(e) =>
                                handleSerialChange(i, e.target.value)
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {!isApproved && (
                    <div className="update-add-part-container">
                      <button className="btn-add-part" onClick={addPartRow}>
                        + Thêm linh kiện
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ⚡ Footer nút hành động */}
              <div className="update-modal__footer">
                <button
                  className="update-btn update-btn-secondary"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Đóng
                </button>
                {!isApproved && (
                  <>
                    <button
                      className="update-btn update-btn-outline"
                      onClick={() => handleSubmit("save_only")}
                      disabled={uploading}
                    >
                      {uploading ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      className={`update-btn update-btn-send ${
                        isValidForSend ? "active" : ""
                      }`}
                      onClick={() => handleSubmit("send_staff")}
                      disabled={!isValidForSend || uploading}
                    >
                      {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
                    </button>
                  </>
                )}
                {isApproved && (
                  <button
                    className={`update-btn update-btn-complete ${
                      allSerialsFilled ? "active" : ""
                    }`}
                    onClick={() => handleSubmit("complete_repair")}
                    disabled={!allSerialsFilled || uploading}
                  >
                    {uploading ? "Đang hoàn tất..." : "Hoàn tất sửa chữa"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {zoomedImage && (
        <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="zoomed" className="zoomed-img" />
        </div>
      )}
    </div>
  );
}
