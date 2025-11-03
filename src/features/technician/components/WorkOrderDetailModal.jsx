// src/features/technician/components/WorkOrderDetailModal.jsx
import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/atoms/Button/Button";
import { Modal } from "../../../components/molecules/Modal/Modal";
import { formatDate } from "../../../services/helpers";
import "./WorkOrderDetailModal.css";

export const WorkOrderDetailModal = ({
  // Props điều khiển modal
  isOpen,
  onClose,
  workOrderData,

  // Dữ liệu gợi ý cho phần linh kiện
  categories = [],
  models = [],
  serials = [],

  // Nếu true thì modal khởi tạo 1 hàng linh kiện rỗng khi không có data
  initiallyShowOnePart = true,

  // Hàm helper lấy dữ liệu gợi ý
  fetchCategories,
  fetchModels,
  fetchSerial,
  fetchCategoryByModel,

  // 🆕 Các hàm API thực tế được truyền từ Container
  uploadImages,
  submitInspection,
  submitRepair,
}) => {
  console.log("💡 workOrderData received in modal:", workOrderData);
  console.log("💡 warrantyClaim:", workOrderData?.warrantyClaim);
  console.log("💡 claimParts:", workOrderData?.warrantyClaim?.claimParts);
  // Nếu không có workOrderData thì không render modal
  if (!workOrderData) return null;

  // warrantyInfo có thể là undefined nếu backend chưa trả về warrantyClaim
  const warrantyInfo = workOrderData.warrantyClaim;
  const campaignInfo = workOrderData.campaign;
  const targetType = (workOrderData.target || "").toLowerCase();
  const isWarrantyTarget = targetType === "warranty";
  const isCampaignTarget = targetType === "campaign";

  const vehicleVin = workOrderData.vin || warrantyInfo?.vin || "N/A";
  const vehicleModel = workOrderData.model || warrantyInfo?.model || "N/A";
  const vehicleYear =
    workOrderData.year !== undefined && workOrderData.year !== null
      ? workOrderData.year
      : warrantyInfo?.year ?? "N/A";

  const submissionTargetId =
    isWarrantyTarget && warrantyInfo?.claimId
      ? warrantyInfo.claimId
      : workOrderData.targetId;

  // State cho phần inspection
  const [inspectionDesc, setInspectionDesc] = React.useState("");
  const [attachments, setAttachments] = React.useState([]);

  // State cho preview ảnh (khi click ảnh sẽ hiển thị overlay)
  const [previewImage, setPreviewImage] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // ✅ loading state

  const fileInputRef = React.useRef(null);

  // ========== File Handlers ==========

  // Xử lý chọn file (đính kèm ảnh cho inspection)
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  // Bỏ 1 file đã chọn
  const handleRemoveFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // State chứa các hàng linh kiện (parts)
  const makeEmptyPart = (overrides = {}) => ({
    claimPartId: null,
    campaignPartId: null,
    action: isCampaignTarget ? "Replace" : "",
    category: "",
    model: "",
    serial: "",
    newSerial: "",
    availableModels: [],
    availableSerials: [],
    ...overrides,
  });

  const normalizedCampaignSerials = (() => {
    if (!campaignInfo) return [];

    const directSerials = [
      campaignInfo.serials,
      campaignInfo.serialNumbers,
      campaignInfo.oldSerialNumbers,
      campaignInfo.serialNumberOlds,
    ].find((candidate) => Array.isArray(candidate));

    if (Array.isArray(directSerials)) return directSerials.filter(Boolean);

    if (Array.isArray(campaignInfo.parts)) {
      return campaignInfo.parts
        .map(
          (part) =>
            part?.serialNumberOld || part?.serial || part?.serialNumber || part?.oldSerial
        )
        .filter(Boolean);
    }

    return [];
  })();

  const campaignModelName =
    campaignInfo?.partModel || campaignInfo?.model || campaignInfo?.part?.model || "";

  const campaignPartsFromApi = Array.isArray(campaignInfo?.parts)
    ? campaignInfo.parts.map((part) =>
        makeEmptyPart({
          campaignPartId: part?.campaignPartId || part?.id || null,
          action: part?.action || "Replace",
          category: part?.category || part?.partCategory || "",
          model:
            part?.model || part?.partModel || part?.part?.model || campaignModelName,
          serial:
            part?.serialNumberOld ||
            part?.serial ||
            part?.serialNumber ||
            part?.oldSerial ||
            "",
          newSerial: part?.serialNumberNew || part?.newSerial || "",
        })
      )
    : [];

  const [parts, setParts] = React.useState(() => {
    if (isCampaignTarget) {
      if (campaignPartsFromApi.length > 0) return campaignPartsFromApi;
      if (normalizedCampaignSerials.length > 0) {
        return normalizedCampaignSerials.map((serial) =>
          makeEmptyPart({
            action: "Replace",
            model: campaignModelName,
            serial,
          })
        );
      }
      if (initiallyShowOnePart) {
        return [
          makeEmptyPart({
            action: "Replace",
            model: campaignModelName,
          }),
        ];
      }
      return [];
    }

    // Biến chứa parts trả từ API (nếu có) cho warranty
    const apiParts = (workOrderData.warrantyClaim?.claimParts || []).map((p) =>
      makeEmptyPart({
        claimPartId: p.claimPartId,
        action: p.action || "",
        category: p.category || "",
        model: p.model || "",
        serial: p.serialNumberOld || p.serial || "",
        newSerial: p.serialNumberNew || p.newSerial || "",
      })
    );

    if (apiParts.length > 0) return apiParts;
    if (initiallyShowOnePart) return [makeEmptyPart()];
    return [];
  });

  React.useEffect(() => {
    if (!isCampaignTarget || typeof fetchCategoryByModel !== "function") return;
    const modelForCategory = campaignModelName || (parts[0]?.model ?? "");
    if (!modelForCategory) return;

    let isCancelled = false;

    const assignCategory = async () => {
      const categoryData = await fetchCategoryByModel(modelForCategory);
      if (isCancelled) return;

      const resolvedCategory = Array.isArray(categoryData)
        ? categoryData.find(Boolean)
        : typeof categoryData === "string"
        ? categoryData
        : categoryData?.name || categoryData?.categoryName || categoryData?.category;

      if (!resolvedCategory) return;

      setParts((prev) =>
        prev.map((part) =>
          part.model === modelForCategory && !part.category
            ? { ...part, category: resolvedCategory }
            : part
        )
      );
    };

    assignCategory();

    return () => {
      isCancelled = true;
    };
  }, [isCampaignTarget, campaignModelName, fetchCategoryByModel]);

  // Kiểm tra loại công việc (inspection/repair)
  const isInspection =
    (workOrderData.type || "").toLowerCase() === "inspection";
  const isRepair = (workOrderData.type || "").toLowerCase() === "repair";
  const showInspectionEditor = isWarrantyTarget && isInspection;
  const showNewSerialColumn = isRepair || isCampaignTarget;

  // ========== Parts Table Handlers ==========
  // Thêm 1 hàng linh kiện rỗng
  const addPartRow = () => {
    if (isCampaignTarget || !showInspectionEditor) return;
    setParts((prev) => [...prev, makeEmptyPart()]);
  };

  // Xóa hàng linh kiện theo index
  const removePartRow = (index) => {
    if (isCampaignTarget) return;
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  // Cập nhật trường của một hàng linh kiện
  const updatePart = (index, key, value) => {
    setParts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  // ========== Submit Handlers ==========

  // Xử lý submit kết quả kiểm tra (inspection)
  const handleSubmitInspection = async () => {
    if (
      !inspectionDesc.trim() ||
      attachments.length === 0 ||
      parts.length === 0 ||
      parts.some((p) => !p.action || !p.model || !p.serial)
    ) {
      alert("Vui lòng nhập mô tả kiểm tra và gửi ít nhất một hình ảnh!");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload hình ảnh (nếu có)
      let uploadedImages = [];
      if (attachments.length > 0 && typeof uploadImages === "function") {
        uploadedImages = await uploadImages(submissionTargetId, attachments);
      }

      // 2. Chuẩn bị danh sách parts đã chọn
      // Chỉ gửi parts có đủ thông tin (action, model, serial)
      const selectedParts = parts
        .filter((p) => p.action && p.model && p.serial)
        .map((p) => ({
          action: p.action,
          model: p.model,
          serialNumber: p.serial, // Backend yêu cầu field là serialNumber
        }));

      // 3. Tạo payload gửi lên API
      const payload = {
        description: inspectionDesc,
        parts: selectedParts, // Array chứa action, model, serialNumber
      };

      console.log("📤 Sending inspection payload:", payload);

      // 4. Gửi inspection request
      if (typeof submitInspection === "function") {
        const res = await submitInspection(submissionTargetId, payload);
        console.log("✅ Inspection submitted:", res);
        alert("Đã lưu kết quả kiểm tra thành công!");
      } else {
        console.warn("⚠️ submitInspection chưa được truyền từ container");
      }
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi submit inspection:", err);
      alert("Gửi kết quả kiểm tra thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý submit cho repair
  const handleSubmitRepair = async () => {
    try {
      const invalid = parts.some((p) =>
        isCampaignTarget
          ? !p.serial || !p.newSerial
          : !p.claimPartId || !p.newSerial
      );
      if (invalid) {
        alert("Vui lòng nhập đầy đủ thông tin cho tất cả các linh kiện!");
        return;
      }

      setIsSubmitting(true);

      const payload = isCampaignTarget
        ? {
            parts: parts.map((p) => ({
              campaignPartId: p.campaignPartId,
              action: p.action || "Replace",
              category: p.category,
              model: p.model,
              serialNumberOld: p.serial,
              serialNumberNew: p.newSerial,
            })),
          }
        : {
            parts: parts.map((p) => ({
              claimPartId: p.claimPartId,
              serialNumber: p.newSerial,
            })),
          };

      console.log("Payload gửi lên API:", payload);

      if (typeof submitRepair === "function") {
        const res = await submitRepair(submissionTargetId, payload);
        console.log("Repair submitted:", res);
        alert("Đã lưu thông tin sửa chữa thành công!");
      } else {
        console.warn("submitRepair chưa được truyền từ container");
      }

      onClose();
    } catch (err) {
      console.error("Lỗi khi submit repair:", err);
      alert("Gửi thông tin sửa chữa thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Work Order Details`}
      size="lg"
      showFooter={false}
    >
      <div className="work-order-modal">
        {/* Header */}
        <div className="modal-top-row">
          <div className="task-title">
            <strong>Task</strong>{" "}
            <span
              className={`badge status-${workOrderData.type?.toLowerCase()}`}
            >
              {workOrderData.type}
            </span>
            {" • "}
            <span
              className={`badge status-${workOrderData.status
                ?.toLowerCase()
                ?.replace(/\s+/g, "-")}`}
            >
              {workOrderData.status}
            </span>
          </div>
        </div>
        {/* Work order information */}
        <div className="detail-block">
          <h4>Work Order Information</h4>
          <div className="info-container">
            <div className="info-row">
              <div className="label">Work Type</div>
              <div className="content">{workOrderData.type}</div>
            </div>
            <div className="info-row">
              <div className="label">Target</div>
              <div className="content">{workOrderData.target}</div>
            </div>
            <div className="info-row">
              <div className="label">Status</div>
              <div className="content">
                <span
                  className={`badge status-${workOrderData.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {workOrderData.status}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="label">Start Date</div>
              <div className="content">
                {formatDate(workOrderData.startDate)}
              </div>
            </div>
            {workOrderData.endDate && (
              <div className="info-row">
                <div className="label">End Date</div>
                <div className="content">
                  {formatDate(workOrderData.endDate)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle information and issue description (always render; use N/A when missing) */}
        <div className="detail-block">
          <h4>Vehicle Information</h4>
          <div className="info-container">
            <div className="info-row">
              <div className="label">VIN</div>
              <div className="content">{vehicleVin}</div>
            </div>
            <div className="info-row">
              <div className="label">Model</div>
              <div className="content">{vehicleModel}</div>
            </div>
            <div className="info-row">
              <div className="label">Year</div>
              <div className="content">{vehicleYear}</div>
            </div>
          </div>

          {/* Issue Description */}
          {isWarrantyTarget && (
            <div className="description-block">
              <h4>Issue Description</h4>
              <div className="text-block">
                <div className="content">
                  {warrantyInfo?.failureDesc ? warrantyInfo.failureDesc : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>

        {isCampaignTarget && campaignInfo && (
          <div className="detail-block">
            <h4>Campaign Details</h4>
            <div className="info-container">
              <div className="info-row">
                <div className="label">Title</div>
                <div className="content">{campaignInfo.title || "N/A"}</div>
              </div>
              {campaignModelName && (
                <div className="info-row">
                  <div className="label">Part Model</div>
                  <div className="content">{campaignModelName}</div>
                </div>
              )}
              {campaignInfo.description && (
                <div className="info-row">
                  <div className="label">Description</div>
                  <div className="content">{campaignInfo.description}</div>
                </div>
              )}
              <div className="info-row">
                <div className="label">Created At</div>
                <div className="content">
                  {campaignInfo.createdAt
                    ? formatDate(campaignInfo.createdAt)
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail for Technician (staff note for tech) */}
        {isWarrantyTarget && (warrantyInfo?.notes || workOrderData?.notes) && (
          <div className="detail-block">
            <h4>Detail for Technician</h4>
            <div className="text-block">
              <div className="content">
                {warrantyInfo?.notes || workOrderData.notes}
              </div>
            </div>
          </div>
        )}

        {!isWarrantyTarget && workOrderData?.notes && (
          <div className="detail-block">
            <h4>Work Order Notes</h4>
            <div className="text-block">
              <div className="content">{workOrderData.notes}</div>
            </div>
          </div>
        )}

        {/* Inspection details (only shown for Inspection work orders) */}
        {isWarrantyTarget &&
          (workOrderData.type === "Inspection" ||
            workOrderData.type === "Repair") && (
          <div className="detail-block">
            <h4>Inspection Details</h4>

            {/* Existing Images: render only when attachments exist */}
            {warrantyInfo?.attachments &&
              warrantyInfo.attachments.length > 0 && (
                <div className="attachment-section">
                  <h5>Existing Images</h5>
                  <div className="attachments-grid">
                    {warrantyInfo.attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <img
                          src={file.url}
                          alt={`Attachment ${index + 1}`}
                          onClick={() => setPreviewImage(file.url)}
                          style={{ cursor: "zoom-in" }}
                        />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="small" variant="secondary">
                            View
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Hiển thị mô tả kiểm tra trước đó nếu có */}
            {workOrderData.warrantyClaim?.notes && (
              <div className="description-block">
                <h5>Technician's Inspection Notes</h5>
                <div className="text-block">
                  <div className="content">
                    {workOrderData.warrantyClaim.notes}
                  </div>
                </div>
              </div>
            )}

            {/* Form nhập inspection mới chỉ xuất hiện nếu là task Inspection và status=in progress */}
            {workOrderData.type === "Inspection" &&
              workOrderData.status === "in progress" && (
                <div className="inspection-form">
                  <h5>Add Inspection Results</h5>
                  <div className="form-group">
                    <label>Detailed Description:</label>
                    <textarea
                      value={inspectionDesc}
                      onChange={(e) => setInspectionDesc(e.target.value)}
                      placeholder="Enter detailed inspection results..."
                      rows={4}
                      className="inspection-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label>Attached Images:</label>
                    <div className="upload-section">
                      <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                    </div>
                    {attachments.length > 0 && (
                      <div className="attachments-preview">
                        {attachments.map((file, index) => (
                          <div key={index} className="preview-item">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                            />
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() => handleRemoveFile(index)}
                            >
                              X
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Image preview overlay: khi có previewImage thì hiển thị overlay */}
        {previewImage && (
          <div
            className="image-preview-overlay"
            onClick={() => setPreviewImage(null)}
          >
            {/* Nút đóng overlay */}
            <button
              className="image-preview-close"
              onClick={(e) => {
                // Ngăn sự kiện bubble để tránh kích hoạt onClick của overlay
                e.stopPropagation();
                setPreviewImage(null);
              }}
            >
              Close
            </button>
            {/* Click vào ảnh không đóng overlay (stopPropagation) để người dùng có thể tương tác */}
            <img
              src={previewImage}
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Parts to Replace / Repair (both tasks) */}
        <div className="detail-block">
          <h4>Parts to Replace / Repair</h4>

          <div className="parts-table">
            <div className="parts-row parts-row-header">
              <div className="col action">Action</div>
              <div className="col category">Category</div>
              <div className="col model">Model</div>
              <div className="col serial">Serial</div>
              {showNewSerialColumn && (
                <div className="col new-serial">New Serial</div>
              )}
              <div className="col actions-col"></div>
            </div>

            {parts.map((p, idx) => (
              <div key={idx} className="parts-row">
                {/* Campaign work orders: preset replace rows with new serial input */}
                {isCampaignTarget ? (
                  <>
                    <div className="col action">{p.action || "Replace"}</div>
                    <div className="col category">{p.category || "-"}</div>
                    <div className="col model">{p.model || "-"}</div>
                    <div className="col serial">{p.serial || "-"}</div>
                    {showNewSerialColumn && (
                      <div className="col new-serial">
                        <input
                          type="text"
                          placeholder="Enter new serial"
                          value={p.newSerial || ""}
                          onChange={(e) =>
                            updatePart(idx, "newSerial", e.target.value)
                          }
                        />
                      </div>
                    )}
                    <div className="col actions-col"></div>
                  </>
                ) : showInspectionEditor ? (
                  <>
                    <div className="col action">
                      <select
                        value={p.action}
                        onChange={(e) =>
                          updatePart(idx, "action", e.target.value)
                        }
                      >
                        {!p.action && <option value="">Select</option>}
                        <option value="Replace">Replace</option>
                        <option value="Repair">Repair</option>
                      </select>
                    </div>

                    <div className="col category">
                      <select
                        value={p.category}
                        onChange={async (e) => {
                          const newCategory = e.target.value;
                          updatePart(idx, "category", newCategory);
                          updatePart(idx, "model", "");
                          updatePart(idx, "serial", "");
                          
                          // Fetch models riêng cho part này
                          if (typeof fetchModels === "function") {
                            try {
                              const fetchedModels = await fetchModels(newCategory);
                              // Cập nhật availableModels cho part này
                              setParts((prev) => {
                                const copy = [...prev];
                                copy[idx] = { 
                                  ...copy[idx], 
                                  availableModels: fetchedModels || [] 
                                };
                                return copy;
                              });
                            } catch (err) {
                              console.error("Error fetching models:", err);
                            }
                          }
                        }}
                      >
                        {!p.category && (
                          <option value="">Select Category</option>
                        )}
                        {categories.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col model">
                      <select
                        value={p.model}
                        onChange={async (e) => {
                          const newModel = e.target.value;
                          updatePart(idx, "model", newModel);
                          updatePart(idx, "serial", "");
                          const vin =
                            warrantyInfo?.vin ||
                            workOrderData?.warrantyClaim?.vin ||
                            "";
                          
                          // Fetch serials riêng cho part này
                          if (typeof fetchSerial === "function") {
                            try {
                              const fetchedSerials = await fetchSerial(vin, newModel);
                              // Cập nhật availableSerials cho part này
                              setParts((prev) => {
                                const copy = [...prev];
                                copy[idx] = { 
                                  ...copy[idx], 
                                  availableSerials: fetchedSerials || [] 
                                };
                                return copy;
                              });
                            } catch (err) {
                              console.error("Error fetching serials:", err);
                            }
                          }
                        }}
                        disabled={!p.category}
                      >
                        {!p.model && <option value="">Select Model</option>}
                        {(p.availableModels || []).map((m, i) => (
                          <option key={i} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col serial">
                      <select
                        value={p.serial}
                        onChange={(e) =>
                          updatePart(idx, "serial", e.target.value)
                        }
                        disabled={!p.model}
                      >
                        {!p.serial && <option value="">Select Serial</option>}
                        {(p.availableSerials || []).map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col actions-col">
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removePartRow(idx)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Nếu là Repair: tất cả field readonly, chỉ cho nhập newSerial */
                  <>
                    <div className="col action">{p.action || "-"}</div>
                    <div className="col category">{p.category || "-"}</div>
                    <div className="col model">{p.model || "-"}</div>
                    <div className="col serial">{p.serial || "-"}</div>

                    <div className="col new-serial">
                      <input
                        type="text"
                        placeholder="Enter new serial"
                        value={p.newSerial || ""}
                        onChange={(e) =>
                          updatePart(idx, "newSerial", e.target.value)
                        }
                      />
                    </div>

                    <div className="col actions-col"></div>
                  </>
                )}
              </div>
            ))}

            {parts.length === 0 && (
              <div className="parts-empty-note">
                {showInspectionEditor
                  ? "Không có linh kiện nào. Bấm \"＋ Thêm hàng\" để bắt đầu thêm."
                  : "Không có linh kiện nào."}
              </div>
            )}
            {showInspectionEditor && (
              <div className="parts-actions">
                <Button variant="secondary" onClick={addPartRow}>
                  ＋ Thêm hàng
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* datalist cho gợi ý (nếu bạn truyền categories/models/serials từ container) */}
        <datalist id="category-list">
          {categories.map((c, i) => (
            <option key={i} value={c} />
          ))}
        </datalist>
        <datalist id="model-list">
          {models.map((m, i) => (
            <option key={i} value={m} />
          ))}
        </datalist>
        <datalist id="serial-list">
          {serials.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>

        {/* Footer actions */}
        <div className="modal-footer">
          {showInspectionEditor && (
            <Button
              variant="primary"
              onClick={handleSubmitInspection}
              disabled={!inspectionDesc.trim() && attachments.length === 0}
            >
              Lưu kết quả kiểm tra
            </Button>
          )}

          {isRepair && (
            <Button
              variant="primary"
              onClick={() => {
                // Kiểm tra xem có phần tử nào thiếu newSerial không
                const invalid = parts.some((p) => !p.newSerial);
                console.log("Checking parts for newSerial:", parts, {
                  invalid,
                });

                if (invalid) {
                  console.log("Found invalid parts, alerting user.");
                  alert(
                    "Vui lòng nhập đầy đủ thông tin cho tất cả các linh kiện!"
                  );
                  return;
                }

                // Nếu tất cả hợp lệ thì gọi hàm xử lý
                handleSubmitRepair();
              }}
              disabled={parts.length === 0}
            >
              Lưu thông tin sửa chữa
            </Button>
          )}

          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

WorkOrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workOrderData: PropTypes.shape({
    workOrderId: PropTypes.string.isRequired,
    assignedTo: PropTypes.string,
    type: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    description: PropTypes.string,
    notes: PropTypes.string,
    vin: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    parts: PropTypes.arrayOf(
      PropTypes.shape({
        action: PropTypes.string,
        category: PropTypes.string,
        model: PropTypes.string,
        serial: PropTypes.string,
        newSerial: PropTypes.string,
      })
    ),
    warrantyClaim: PropTypes.shape({
      claimId: PropTypes.string.isRequired,
      vin: PropTypes.string,
      failureDesc: PropTypes.string,
      status: PropTypes.string,
      model: PropTypes.string,
      year: PropTypes.number,
      attachments: PropTypes.array,
      categories: PropTypes.array,
      models: PropTypes.array,
      serials: PropTypes.array,
    }),
    campaign: PropTypes.shape({
      campaignVehicleId: PropTypes.string,
      campaignId: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      createdAt: PropTypes.string,
      partModel: PropTypes.string,
      model: PropTypes.string,
      serials: PropTypes.arrayOf(PropTypes.string),
      serialNumbers: PropTypes.arrayOf(PropTypes.string),
      oldSerialNumbers: PropTypes.arrayOf(PropTypes.string),
      parts: PropTypes.arrayOf(
        PropTypes.shape({
          campaignPartId: PropTypes.string,
          action: PropTypes.string,
          category: PropTypes.string,
          model: PropTypes.string,
          serialNumberOld: PropTypes.string,
          serialNumberNew: PropTypes.string,
        })
      ),
    }),
  }),
  categories: PropTypes.array,
  models: PropTypes.array,
  serials: PropTypes.array,
  fetchCategories: PropTypes.func,
  fetchModels: PropTypes.func,
  fetchSerial: PropTypes.func,
  fetchCategoryByModel: PropTypes.func,
};

WorkOrderDetailModal.defaultProps = {
  categories: [],
  models: [],
  serials: [],
  initiallyShowOnePart: true,
  fetchCategories: null,
  fetchModels: null,
  fetchSerial: null,
  fetchCategoryByModel: null,
};
