import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/atoms/Button/Button";
import { Modal } from "../../../components/molecules/Modal/Modal";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { formatDate } from "../../../services/helpers";
import "./WorkOrderDetailModal.css";

import { ConfirmDialog } from "../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

export const WorkOrderDetailModal = ({
  isOpen,
  onClose,
  workOrderData,

  categories = [],
  models = [],
  serials = [],

  // true thi modal khoi tao 1 hang linh kien rong khi khong co data
  initiallyShowOnePart = true,
  fetchCategories,
  fetchModels,
  fetchSerial,
  fetchCategoryByModel,
  uploadImages,
  submitInspection,
  submitRepair,
}) => {
  if (!workOrderData) return null;

  const warrantyInfo = workOrderData.warrantyClaim;
  const campaignInfo = workOrderData.campaign;
  const campaignReplacementModel = campaignInfo?.replacementPartModel || "";
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
  const [inspectionDesc, setInspectionDesc] = React.useState(
    warrantyInfo?.description || ""
  );
  // attachments stored as { file: File, url: string }
  const [attachments, setAttachments] = React.useState([]);
  const attachmentsRef = React.useRef(attachments);
  const [previewImage, setPreviewImage] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fileInputRef = React.useRef(null);
  const [confirmDialog, setConfirmDialog] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const handleFileUpload = (event) => {
    const list = Array.from(event.target.files || []).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachments((prev) => {
      const next = [...prev, ...list];
      attachmentsRef.current = next;
      return next;
    });
  };

  const handleRemoveFile = (index) => {
    setAttachments((prev) => {
      const toRemove = prev[index];
      if (toRemove?.url) {
        try {
          URL.revokeObjectURL(toRemove.url);
        } catch (e) {}
      }
      const next = prev.filter((_, i) => i !== index);
      attachmentsRef.current = next;
      return next;
    });
  };

  React.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  React.useEffect(() => {
    return () => {
      try {
        (attachmentsRef.current || []).forEach((a) => {
          if (a?.url) URL.revokeObjectURL(a.url);
        });
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const makeEmptyPart = (overrides = {}) => ({
    claimPartId: null,
    campaignPartId: null,
    action: isCampaignTarget ? "Replace" : "",
    category: "",
    model: "",
    serial: "",
    newSerial: "",
    newModel: "",
    availableModels: [],
    availableSerials: [],
    ...overrides,
  });

  const normalizedCampaignSerials = (() => {
    if (!campaignInfo) return [];

    const directSerials = [
      campaignInfo.serials,
      campaignInfo.serialNumbers,
      campaignInfo.oldSerials,
      campaignInfo.oldSerialNumbers,
      campaignInfo.serialNumberOlds,
    ].find((candidate) => Array.isArray(candidate));

    if (Array.isArray(directSerials)) return directSerials.filter(Boolean);

    if (Array.isArray(campaignInfo.parts)) {
      return campaignInfo.parts
        .map(
          (part) =>
            part?.serialNumberOld ||
            part?.serial ||
            part?.serialNumber ||
            part?.oldSerial
        )
        .filter(Boolean);
    }

    return [];
  })();

  const campaignModelName =
    campaignInfo?.partModel ||
    campaignInfo?.model ||
    campaignInfo?.part?.model ||
    "";

  const campaignPartsFromApi = Array.isArray(campaignInfo?.parts)
    ? campaignInfo.parts.map((part) =>
        makeEmptyPart({
          campaignPartId: part?.campaignPartId || part?.id || null,
          action: part?.action || "Replace",
          category: part?.category || part?.partCategory || "",
          model:
            part?.model ||
            part?.partModel ||
            part?.part?.model ||
            campaignModelName,
          serial:
            part?.serialNumberOld ||
            part?.serial ||
            part?.serialNumber ||
            part?.oldSerial ||
            "",
          newSerial: part?.serialNumberNew || part?.newSerial || "",
          newModel:
            part?.replacementPartModel || campaignReplacementModel || "",
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
            newModel: campaignReplacementModel,
          })
        );
      }
      if (initiallyShowOnePart) {
        return [
          makeEmptyPart({
            action: "Replace",
            model: campaignModelName,
            newModel: campaignReplacementModel,
          }),
        ];
      }
      return [];
    }

    const apiParts = (workOrderData.warrantyClaim?.claimParts || []).map((p) =>
      makeEmptyPart({
        claimPartId: p.claimPartId,
        action: p.action || "",
        category: p.category || "",
        model: p.model || "",
        serial: p.serialNumberOld || p.serial || "",
        newSerial: p.serialNumberNew || p.newSerial || "",
        newModel: p.newModel || "",
      })
    );

    if (apiParts.length > 0) return apiParts;
    if (initiallyShowOnePart) return [makeEmptyPart()];
    return [];
  });

  // Prefill model/serial lists for WARRANTY claim parts returned by API (no extra API calls)
  const warrantyPrefillRef = React.useRef(false);
  const warrantyCategoryCacheRef = React.useRef({});

  React.useEffect(() => {
    if (!isWarrantyTarget) return;
    if (warrantyPrefillRef.current) return;

    // Only run when we have API-returned parts that may need simple filling
    const needsPrefill = parts.some(
      (p) =>
        p.claimPartId &&
        (!(Array.isArray(p.availableModels) && p.availableModels.length) ||
          !(Array.isArray(p.availableSerials) && p.availableSerials.length))
    );
    if (!needsPrefill) return;

    let cancelled = false;

    (async () => {
      try {
        const updated = await Promise.all(
          parts.map(async (p) => {
            if (!p.claimPartId) return p;

            let newP = { ...p };

            if (
              !Array.isArray(newP.availableModels) ||
              newP.availableModels.length === 0
            ) {
              newP.availableModels = newP.model ? [newP.model] : [];
            }
            if (
              !Array.isArray(newP.availableSerials) ||
              newP.availableSerials.length === 0
            ) {
              newP.availableSerials = newP.serial ? [newP.serial] : [];
            }

            return newP;
          })
        );

        if (!cancelled) {
          warrantyPrefillRef.current = true;
          setParts(updated);
        }
      } catch (e) {
        console.warn("Warranty prefill failed", e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWarrantyTarget, parts.length]);

  React.useEffect(() => {
    if (!isWarrantyTarget) return;
    if (typeof fetchCategoryByModel !== "function") return;

    const missingCategoryParts = parts.filter(
      (part) => part.claimPartId && part.model && !part.category
    );

    if (missingCategoryParts.length === 0) return;

    let isCancelled = false;

    const modelsToFetch = [
      ...new Set(
        missingCategoryParts
          .map((part) => part.model)
          .filter(
            (model) =>
              model &&
              !Object.prototype.hasOwnProperty.call(
                warrantyCategoryCacheRef.current,
                model
              )
          )
      ),
    ];

    const resolveCategoryValue = (categoryData) =>
      Array.isArray(categoryData)
        ? categoryData.find(Boolean)
        : typeof categoryData === "string"
        ? categoryData
        : categoryData?.name ||
          categoryData?.categoryName ||
          categoryData?.category;

    const assignCategories = async () => {
      if (modelsToFetch.length > 0) {
        await Promise.all(
          modelsToFetch.map(async (model) => {
            try {
              const fetched = await fetchCategoryByModel(model);
              warrantyCategoryCacheRef.current[model] =
                resolveCategoryValue(fetched) || "";
            } catch (err) {
              console.error("Error fetching category for model:", model, err);
              warrantyCategoryCacheRef.current[model] = "";
            }
          })
        );
      }

      if (isCancelled) return;

      setParts((prev) => {
        let mutated = false;
        const next = prev.map((part) => {
          if (!part.claimPartId || part.category || !part.model) return part;
          const cachedCategory = warrantyCategoryCacheRef.current[part.model];
          if (!cachedCategory) return part;
          mutated = true;
          return { ...part, category: cachedCategory };
        });
        return mutated ? next : prev;
      });
    };

    assignCategories();

    return () => {
      isCancelled = true;
    };
  }, [parts, fetchCategoryByModel, isWarrantyTarget]);

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
        : categoryData?.name ||
          categoryData?.categoryName ||
          categoryData?.category;

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

  const isInspection =
    (workOrderData.type || "").toLowerCase() === "inspection";
  const isRepair = (workOrderData.type || "").toLowerCase() === "repair";
  const showInspectionEditor = isWarrantyTarget && isInspection;
  const showNewSerialColumn = isRepair || isCampaignTarget;
  const showNewModelColumn = isCampaignTarget;

  // ========== Parts Table Handlers ==========
  
  // them 1 hang linh kien rong
  const addPartRow = () => {
    if (isCampaignTarget || !showInspectionEditor) return;
    setParts((prev) => [...prev, makeEmptyPart()]);
  };

  // xoa theo index
  const removePartRow = (index) => {
    if (isCampaignTarget) return;
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  // update truong cua mot hang linh kien
  const updatePart = (index, key, value) => {
    setParts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };
  const handleSubmitInspection = async () => {
    const hasExistingAttachments =
      Array.isArray(warrantyInfo?.attachments) &&
      warrantyInfo.attachments.length > 0;
    const hasNewAttachments = attachments.length > 0;

    if (!inspectionDesc.trim()) {
      toast.warn("Please enter the inspection description!");
      return;
    }

    if (!hasExistingAttachments && !hasNewAttachments) {
      toast.warn("Please upload at least one image!");
      return;
    }

    if (
      parts.length === 0 ||
      parts.some((p) => !p.action || !p.model || !p.serial)
    ) {
      toast.warn("Please fill all required fields before submitting");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Confirm Submit",
      message: "Are you sure you want to submit this inspection result?",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          let uploadedImages = [];

          if (attachments.length > 0 && typeof uploadImages === "function") {
            uploadedImages = await uploadImages(
              submissionTargetId,
              attachments.map((a) => a.file)
            );
          }

          const selectedParts = parts
            .filter((p) => p.action && p.model && p.serial)
            .map((p) => ({
              action: p.action,
              model: p.model,
              serialNumber: p.serial,
            }));

          const payload = {
            description: inspectionDesc,
            parts: selectedParts,
          };

          const res = await submitInspection(submissionTargetId, payload);
          toast.success("Inspection submitted successfully!");
          onClose();
        } catch (err) {
          console.error("Error submitting inspection:", err);
          toast.error("Failed to submit inspection!");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const submitRepairInternal = async () => {
    const replaceParts = parts.filter((part) => {
      const action = (part.action || (isCampaignTarget ? "Replace" : ""))
        .toLowerCase()
        .trim();
      return action === "replace";
    });

    if (replaceParts.length === 0) {
      toast.warn("Please complete all part information!");
      return false;
    }

    const missingRequired = replaceParts.some((part) => {
      if (!part.newSerial) return true;
      if (isCampaignTarget) {
        return !part.serial;
      }
      return !part.claimPartId;
    });

    if (missingRequired) {
      toast.warn(" Please complete all part information!");
      return false;
    }

    const payload = isCampaignTarget
      ? {
          replacements: replaceParts.map((p) => ({
            oldSerial: p.serial,
            newSerial: p.newSerial,
          })),
        }
      : {
          parts: replaceParts.map((p) => ({
            claimPartId: p.claimPartId,
            serialNumber: p.newSerial,
          })),
        };

    if (typeof submitRepair === "function") {
      const res = await submitRepair(submissionTargetId, payload, {
        isCampaign: isCampaignTarget,
      });
      toast.success("Repair information saved successfully!");
      return true;
    }

    console.warn("submitRepair chưa được truyền từ container");
    return false;
  };

  const handleSubmitRepair = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Submit",
      message: "Are you sure you want to submit this repair information?",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const ok = await submitRepairInternal();
          if (ok) onClose();
        } catch (err) {
          console.error("Lỗi khi submit repair:", err);
          toast.error("Repair information saved failed!");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Work Order Details`}
      size="lg"
      showFooter={false}
    >
      {isSubmitting && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            borderRadius: "8px",
          }}
        >
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: "16px", fontSize: "16px", fontWeight: "500" }}>
            {attachments.length > 0
              ? "Uploading images and submitting..."
              : "Submitting..."}
          </p>
        </div>
      )}
      <div className="work-order-modal">
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

        {isWarrantyTarget &&
          (workOrderData.type === "Inspection" ||
            workOrderData.type === "Repair") && (
            <div className="detail-block">
              <h4>Inspection Details</h4>

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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {workOrderData.warrantyClaim?.notes && (
                <div className="description-block">
                  <h5> Inspection Notes for Tech</h5>
                  <div className="text-block">
                    <div className="content">
                      {workOrderData.warrantyClaim.notes}
                    </div>
                  </div>
                </div>
              )}

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
                          {attachments.map((att, index) => (
                            <div key={index} className="preview-item">
                              <img
                                src={att.url}
                                alt={`Preview ${index + 1}`}
                                onClick={() => setPreviewImage(att.url)}
                                style={{ cursor: "zoom-in" }}
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

        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title=""
          size="lg"
          showFooter={false}
          showCloseButton={false}
          className="modal-image"
          headerClassName="modal-no-header"
          bodyClassName="modal-image-body"
        >
          {previewImage && (
            <div style={{ position: "relative", textAlign: "center" }}>
              <button
                type="button"
                className="image-close-btn"
                onClick={() => setPreviewImage(null)}
                aria-label="Close preview"
              >
                ×
              </button>
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            </div>
          )}
        </Modal>

        {/* Parts to Replace / Repair */}
        <div className="detail-block">
          <h4>Parts to Replace / Repair</h4>

          <div className="parts-table">
            <div
              className={`parts-row parts-row-header ${
                showNewModelColumn ? "with-new-model" : ""
              }`}
            >
              <div className="col action">Action</div>
              <div className="col category">Category</div>
              <div className="col model"> Part Model</div>
              <div className="col serial">Serial</div>
              {showNewModelColumn && (
                <div className="col new-model">New Model</div>
              )}
              {showNewSerialColumn && (
                <div className="col new-serial">New Serial</div>
              )}
              <div className="col actions-col"></div>
            </div>

            {parts.map((p, idx) => (
              <div
                key={idx}
                className={`parts-row ${
                  showNewModelColumn ? "with-new-model" : ""
                }`}
              >
                {isCampaignTarget ? (
                  <>
                    <div className="col action">{p.action || "Replace"}</div>
                    <div className="col category" title={p.category || "-"}>
                      {p.category || "-"}
                    </div>
                    <div className="col model" title={p.model || "-"}>
                      {p.model || "-"}
                    </div>
                    <div className="col serial">{p.serial || "-"}</div>
                    {showNewModelColumn && (
                      <div
                        className="col new-model"
                        title={p.newModel || campaignReplacementModel || "-"}
                      >
                        {p.newModel || campaignReplacementModel || "-"}
                      </div>
                    )}
                    {showNewSerialColumn && (
                      <div className="col new-serial">
                        <input
                          type="text"
                          placeholder="Enter new serial"
                          value={p.newSerial || ""} //chọn trong cái dropdown list
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
                        title={p.action || ""}
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
                        title={p.category || ""}
                        onChange={async (e) => {
                          const newCategory = e.target.value;
                          updatePart(idx, "category", newCategory);
                          updatePart(idx, "model", "");
                          updatePart(idx, "serial", "");

                          if (typeof fetchModels === "function") {
                            try {
                              const fetchedModels = await fetchModels(
                                vehicleVin,
                                newCategory
                              );
                              setParts((prev) => {
                                const copy = [...prev];
                                copy[idx] = {
                                  ...copy[idx],
                                  availableModels: fetchedModels || [],
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
                        title={p.model || ""}
                        onChange={async (e) => {
                          const newModel = e.target.value;
                          updatePart(idx, "model", newModel);
                          updatePart(idx, "serial", "");
                          const vin = workOrderData?.vin;

                          if (typeof fetchSerial === "function") {
                            try {
                              const fetchedSerials = await fetchSerial(
                                vin,
                                newModel
                              );
                              setParts((prev) => {
                                const copy = [...prev];
                                copy[idx] = {
                                  ...copy[idx],
                                  availableSerials: fetchedSerials || [],
                                };
                                return copy;
                              });
                            } catch (err) {
                              console.error("Error fetching serials:", err);
                            }
                          }
                        }}
                        disabled={false}
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
                        title={p.serial || ""}
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

                    {showNewModelColumn && (
                      <div
                        className="col new-model"
                        title={p.newModel || campaignReplacementModel || "-"}
                      >
                        {p.newModel || campaignReplacementModel || "-"}
                      </div>
                    )}

                    {showNewSerialColumn && (
                      <div className="col new-serial">
                        {p.action === "Replace" ? (
                          <input
                            type="text"
                            placeholder="Enter new serial"
                            value={p.newSerial || ""}
                            onChange={(e) =>
                              updatePart(idx, "newSerial", e.target.value)
                            }
                          />
                        ) : (
                          <div className="empty-new-serial">-</div>
                        )}
                      </div>
                    )}

                    <div className="col actions-col">
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removePartRow(idx)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  /* neu là Repair: field readonly,  nhap newSerial */
                  <>
                    <div className="col action">{p.action || "-"}</div>
                    <div className="col category" title={p.category || "-"}>
                      {p.category || "-"}
                    </div>
                    <div className="col model" title={p.model || "-"}>
                      {p.model || "-"}
                    </div>
                    <div className="col serial">{p.serial || "-"}</div>

                    {showNewModelColumn && (
                      <div
                        className="col new-model"
                        title={p.newModel || campaignReplacementModel || "-"}
                      >
                        {p.newModel || campaignReplacementModel || "-"}
                      </div>
                    )}

                    {showNewSerialColumn && (
                      <div className="col new-serial">
                        {p.action === "Replace" ? (
                          <input
                            type="text"
                            placeholder="Enter new serial"
                            value={p.newSerial || ""}
                            onChange={(e) =>
                              updatePart(idx, "newSerial", e.target.value)
                            }
                          />
                        ) : (
                          <div className="empty-new-serial">-</div>
                        )}
                      </div>
                    )}

                    <div className="col actions-col"></div>
                  </>
                )}
              </div>
            ))}

            {parts.length === 0 && (
              <div className="parts-empty-note">
                {showInspectionEditor
                  ? 'No parts here. Click "＋ Add row" to start adding.'
                  : "No parts here."}
              </div>
            )}
            {showInspectionEditor && (
              <div className="parts-actions">
                <Button variant="secondary" onClick={addPartRow}>
                  ＋ Add row
                </Button>
              </div>
            )}
          </div>
        </div>

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

        {/* <div>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          {showInspectionEditor && (
            <Button
              variant="primary"
              onClick={handleSubmitInspection}
              disabled={
                (!inspectionDesc.trim() && attachments.length === 0) ||
                isSubmitting
              }
            >
              {isSubmitting ? "Submitting..." : "Save Inspection"}
            </Button>
          )}

          {isRepair && (
            <Button
              variant="primary"
              onClick={() => {
                handleSubmitRepair();
              }}
              disabled={parts.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save Repair"}
            </Button>
          )}
        </div> */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
            alignItems: "center",
          }}
        >
          {/* Nút Close bên trái */}
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {/* Các nút Save sẽ được đẩy sang phải */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {showInspectionEditor && (
              <Button
                variant="primary"
                onClick={handleSubmitInspection}
                disabled={
                  (!inspectionDesc.trim() && attachments.length === 0) ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Submitting..." : "Save Inspection"}
              </Button>
            )}

            {isRepair && (
              <Button
                variant="primary"
                onClick={handleSubmitRepair}
                disabled={parts.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Save Repair"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        isLoading={isSubmitting}
      />
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
      replacementPartModel: PropTypes.string,
      parts: PropTypes.arrayOf(
        PropTypes.shape({
          campaignPartId: PropTypes.string,
          action: PropTypes.string,
          category: PropTypes.string,
          model: PropTypes.string,
          serialNumberOld: PropTypes.string,
          serialNumberNew: PropTypes.string,
          replacementPartModel: PropTypes.string,
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
