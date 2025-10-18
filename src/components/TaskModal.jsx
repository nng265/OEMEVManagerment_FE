import React, { useState, useEffect } from "react";
import "./TaskModal.css";
import PartsTable from "./PartsTable";
import { request, ApiEnum } from "../services/NetworkUntil";

export default function TaskModal({ order, onClose, onSave }) {
  const [techDescription, setTechDescription] = useState(
    order.techDescription || ""
  );
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [parts, setParts] = useState(order.parts || []);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const isRepair = order.taskType === "repair";
  const isInspection = order.taskType === "inspection";

  useEffect(() => {
    // Load existing images if any
    if (order.images && order.images.length > 0) {
      setImages(order.images);
    }
  }, [order]);

  useEffect(() => {
    // Create preview URLs for new images
    if (newImages.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newImages]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeOldImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMoreImages = () => {
    document.getElementById("file-input-modal").click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload new images if any
      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((file) => {
          formData.append("files", file);
        });

        // Note: You might need to adjust headers for FormData
        const imageResponse = await fetch(
          `https://maximum-glorious-ladybird.ngrok-free.app/api${ApiEnum.UPLOAD_IMAGE.path}`,
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          uploadedImageUrls = imageData.data || [];
        }
      }

      // Prepare update data
      const updateData = {
        id: order.id,
        techDescription,
        images: [...images, ...uploadedImageUrls],
        parts,
        status: "completed",
      };

      await onSave(updateData);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Không thể lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className="task-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal-header">
          <h2>
            Task:{" "}
            <span
              className={`task-badge ${isInspection ? "inspection" : "repair"}`}
            >
              {isInspection ? "Kiểm tra" : "Sửa chữa"}
            </span>
          </h2>
          <button className="task-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="task-modal-body">
          {/* Vehicle Information */}
          <section className="task-section">
            <h3> Thông tin xe</h3>
            <div className="task-info-grid">
              <div className="task-info-item">
                <span className="task-info-label">Model:</span>
                <span className="task-info-value">
                  {order.vehicle?.model || "N/A"}
                </span>
              </div>
              <div className="task-info-item">
                <span className="task-info-label">VIN:</span>
                <span className="task-info-value">
                  {order.vehicle?.vin || "N/A"}
                </span>
              </div>
              <div className="task-info-item">
                <span className="task-info-label">Year:</span>
                <span className="task-info-value">
                  {order.vehicle?.year || "N/A"}
                </span>
              </div>
            </div>
          </section>

          {/* Issue Description */}
          <section className="task-section">
            <h3> Mô tả lỗi của khách hàng</h3>
            <p className="task-customer-issue">
              {order.issueDescription || "Không có mô tả"}
            </p>
          </section>

          {/* Inspection/Repair Detail */}
          <section className="task-section">
            <h3>{isInspection ? "Chi tiết kiểm tra" : "Chi tiết sửa chữa"}</h3>

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="task-images-section">
                <label className="task-label">Hình ảnh hiện có:</label>
                <div className="task-images-grid">
                  {images.map((url, index) => (
                    <div key={index} className="task-image-item">
                      <img
                        src={url}
                        alt={`existing-${index}`}
                        onClick={() => setZoomedImage(url)}
                      />
                      <button
                        className="task-image-remove"
                        onClick={() => removeOldImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {previewUrls.length > 0 && (
              <div className="task-images-section">
                <label className="task-label">Hình ảnh mới:</label>
                <div className="task-images-grid">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="task-image-item">
                      <img
                        src={url}
                        alt={`new-${index}`}
                        onClick={() => setZoomedImage(url)}
                      />
                      <button
                        className="task-image-remove"
                        onClick={() => removeNewImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            <button
              className="task-add-images-btn"
              onClick={handleAddMoreImages}
            >
              Thêm hình ảnh
            </button>
            <input
              id="file-input-modal"
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Tech Description */}
            <div className="task-description-section">
              <label className="task-label-note">
                {isInspection
                  ? "Mô tả lỗi của Tech "
                  : "Mô tả sửa chữa của Tech "}
              </label>
              <textarea
                className="task-textarea"
                rows={4}
                placeholder="Nhập mô tả chi tiết..."
                value={techDescription}
                onChange={(e) => setTechDescription(e.target.value)}
              />
            </div>
          </section>

          {/* Parts to Replace/Repair */}
          <section className="task-section">
            <h3> Linh kiện sửa chữa/thay thế</h3>
            <PartsTable parts={parts} setParts={setParts} isRepair={isRepair} />
          </section>

          {isRepair && (
            <section className="task-section">
              <div className="task-repair-note">
                <strong>Lưu ý:</strong> Với task sửa chữa, hãy nhập serial mới
                cho các linh kiện được thay thế.
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <button className="task-btn task-btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            className="task-btn task-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {/* Zoomed Image Overlay */}
        {zoomedImage && (
          <div
            className="task-zoom-overlay"
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} alt="zoomed" className="task-zoomed-image" />
          </div>
        )}
      </div>
    </div>
  );
}
