// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../../components/molecules/Modal/Modal";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { Input } from "../../../../components/atoms/Input/Input";
// import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
// import "./AddCampaignModal.css";
// import { request, ApiEnum } from "../../../../services/NetworkUntil";
// import { toast } from "react-toastify";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

// export const AddCampaignModal = ({ isOpen, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     title: "",
//     type: "",
//     target: "",
//     oldTarget: "",
//     targetCategory: "",
//     startDate: "",
//     endDate: "",
//     description: "",
//   });

//   // Tính ngày min = ngày hôm nay + 1
//   const getMinDate = () => {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate());
//     return tomorrow.toISOString().split("T")[0];
//   };
//   const minDate = getMinDate();
//   const [categories, setCategories] = useState([]);
//   const [models, setModels] = useState([]);
//   const [loadingCats, setLoadingCats] = useState(false);
//   const [loadingModels, setLoadingModels] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [pendingPayload, setPendingPayload] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   //  Reset form mỗi khi mở lại modal
//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         title: "",
//         type: "",
//         target: "",
//         oldTarget: "",
//         targetCategory: "",
//         startDate: "",
//         endDate: "",
//         description: "",
//       });
//     }
//   }, [isOpen]);

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       setLoadingCats(true);
//       try {
//         const res = await request(ApiEnum.GET_PART_CATEGORIES);
//         const cats = Array.isArray(res)
//           ? res
//           : res?.success && Array.isArray(res.data)
//           ? res.data
//           : [];
//         setCategories(cats);
//       } catch (err) {
//         console.error("Error fetching part categories:", err);
//         toast.error("Failed to load part categories");
//         setCategories([]);
//       } finally {
//         setLoadingCats(false);
//       }
//     };
//     if (isOpen) fetchCategories();
//   }, [isOpen]);

//   const fetchModelsByCategory = async (category) => {
//     if (!category) {
//       setModels([]);
//       return;
//     }
//     setLoadingModels(true);
//     try {
//       const res = await request(ApiEnum.GET_PART_MODELS, { category });
//       const list = Array.isArray(res)
//         ? res
//         : res?.success && Array.isArray(res.data)
//         ? res.data
//         : [];
//       setModels(list);
//     } catch (err) {
//       console.error("Error fetching models by category:", err);
//       toast.error("Failed to load part models");
//       setModels([]);
//     } finally {
//       setLoadingModels(false);
//     }
//   };

//   // Khi chọn category, gọi hàm này để lấy danh sách models tương ứng.
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "type") {
//       setFormData((prev) => ({
//         ...prev,
//         type: value,
//         oldTarget: "",
//         target: "",
//       }));
//       return;
//     }
//     if (name === "targetCategory") {
//       setFormData((prev) => ({
//         ...prev,
//         targetCategory: value,
//         oldTarget: "",
//         target: "",
//       }));
//       fetchModelsByCategory(value);
//       return;
//     }
//     if (name === "oldTarget") {
//       setFormData((prev) => ({
//         ...prev,
//         oldTarget: value,
//         target: prev.target === value ? "" : prev.target,
//       }));
//       return;
//     }
//     if (name === "target") {
//       setFormData((prev) => ({
//         ...prev,
//         target: value,
//         oldTarget: prev.oldTarget === value ? "" : prev.oldTarget,
//       }));
//       return;
//     }
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (
//       !formData.title ||
//       !formData.type ||
//       !formData.targetCategory ||
//       !formData.oldTarget ||
//       !formData.target ||
//       !formData.startDate ||
//       !formData.endDate ||
//       !formData.description
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     if (formData.oldTarget === formData.target) {
//       toast.error("Old Model and New Model must be different");
//       return;
//     }

//     const payload = {
//       type: formData.type,
//       title: formData.title,
//       description: formData.description,
//       partModel: formData.oldTarget,
//       replacementPartModel: formData.target,
//       startDate: formData.startDate,
//       endDate: formData.endDate,
//     };
//     setPendingPayload(payload);
//     setShowConfirm(true);
//   };

//   const handleConfirm = async () => {
//     if (!pendingPayload) return;
//     // set processing so modal shows loading overlay
//     try {
//       setProcessing(true);
//       const result = onSubmit && onSubmit(pendingPayload);
//       if (result && typeof result.then === "function") {
//         await result; // <-- modal sẽ giữ loading overlay cho đến khi promise resolve/reject
//       }
//     } catch (err) {
//       console.error("Error submitting campaign:", err);
//       // keep modal open so user can retry or see errors
//     } finally {
//       setProcessing(false);
//       setShowConfirm(false);
//       setPendingPayload(null);
//     }
//   };

//   const handleCancelConfirm = () => {
//     setShowConfirm(false);
//     setPendingPayload(null);
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       title="Create Service Campaign"
//       onClose={onClose}
//       showFooter={false}
//       size="lg"
//     >
//       {processing && (
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(255,255,255,0.7)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 9999,
//           }}
//         >
//           <div style={{ textAlign: "center" }}>
//             <LoadingSpinner />
//             <div style={{ marginTop: 8, color: "#374151" }}>Creating...</div>
//           </div>
//         </div>
//       )}
//       <form className="add-campaign-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Campaign Title *</label>
//           <Input
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             placeholder="Enter campaign title"
//           />
//         </div>

//         <div className="form-group">
//           <label>Description *</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             placeholder="Enter campaign details..."
//             className="form-textarea"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group half">
//             <label>Type *</label>
//             <select
//               name="type"
//               value={formData.type}
//               onChange={handleChange}
//               className="form-select"
//               required
//             >
//               {formData.type === "" ? (
//                 <>
//                   <option value="" disabled>
//                     -- Select type --
//                   </option>
//                   <option value="Recall">Recall</option>
//                   <option value="Service">Service</option>
//                 </>
//               ) : (
//                 <>
//                   <option value={formData.type} hidden>
//                     {formData.type}
//                   </option>
//                   {["Recall", "Service"]
//                     .filter((t) => t !== formData.type)
//                     .map((t) => (
//                       <option key={t} value={t}>
//                         {t}
//                       </option>
//                     ))}
//                 </>
//               )}
//             </select>
//           </div>

//           <div className="form-group half">
//             <label>Target Category *</label>
//             {loadingCats ? (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "10px",
//                 }}
//               >
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <select
//                 name="targetCategory"
//                 value={formData.targetCategory}
//                 onChange={async (e) => {
//                   const value = e.target.value;
//                   setFormData((prev) => ({
//                     ...prev,
//                     targetCategory: value,
//                     target: "",
//                     oldTarget: "",
//                   }));
//                   await fetchModelsByCategory(value);
//                 }}
//                 className="form-select"
//                 required
//               >
//                 {formData.targetCategory === "" && (
//                   <option value="" disabled>
//                     -- Select category --
//                   </option>
//                 )}
//                 {categories.map((c, i) => (
//                   <option key={i} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group half">
//             <label>Target Part Model (Old) *</label>
//             {loadingModels ? (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "10px",
//                 }}
//               >
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <select
//                 name="oldTarget"
//                 value={formData.oldTarget}
//                 onChange={handleChange}
//                 className="form-select"
//                 required
//                 disabled={!formData.targetCategory}
//               >
//                 {formData.oldTarget === "" && (
//                   <option value="" disabled>
//                     {formData.targetCategory
//                       ? "-- Select old part model --"
//                       : "Select category first"}
//                   </option>
//                 )}
//                 {models
//                   .filter((m) => m && m !== formData.target)
//                   .map((m, idx) => (
//                     <option key={idx} value={m}>
//                       {m}
//                     </option>
//                   ))}
//               </select>
//             )}
//           </div>

//           <div className="form-group half">
//             <label>Target Part Model (New) *</label>
//             {loadingModels ? (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "10px",
//                 }}
//               >
//                 <LoadingSpinner />
//               </div>
//             ) : (
//               <select
//                 name="target"
//                 value={formData.target}
//                 onChange={handleChange}
//                 className="form-select"
//                 required
//                 disabled={!formData.targetCategory}
//               >
//                 {formData.target === "" && (
//                   <option value="" disabled>
//                     {formData.targetCategory
//                       ? "-- Select part model --"
//                       : "Select category first"}
//                   </option>
//                 )}
//                 {models
//                   .filter((m) => m && m !== formData.oldTarget)
//                   .map((m, idx) => (
//                     <option key={idx} value={m}>
//                       {m}
//                     </option>
//                   ))}
//               </select>
//             )}
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group half">
//             <label>Start Date *</label>
//             <Input
//               type="date"
//               name="startDate"
//               min={minDate}
//               value={formData.startDate}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group half">
//             <label>End Date *</label>
//             <Input
//               type="date"
//               name="endDate"
//               min={minDate}
//               value={formData.endDate}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <div className="form-actions">
//           <Button
//             type="button"
//             variant="secondary"
//             className="btn-cancel"
//             onClick={onClose}
//             disabled={processing}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" disabled={processing}>
//             {processing ? "Creating…" : "Create Campaign & Notify Customers"}
//           </Button>
//         </div>
//       </form>

//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Confirm Campaign Creation"
//         message="Are you sure you want to create this campaign and notify customers?"
//         confirmLabel="Yes, Create"
//         cancelLabel="Cancel"
//         onConfirm={handleConfirm}
//         onCancel={handleCancelConfirm}
//       />
//     </Modal>
//   );
// };

// AddCampaignModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
// };

// export default AddCampaignModal;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import "./AddCampaignModal.css";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

export const AddCampaignModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    target: "",
    oldTarget: "",
    targetCategory: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };
  const minDate = getMinDate();

  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        type: "",
        target: "",
        oldTarget: "",
        targetCategory: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  }, [isOpen]);

  // Fetch categories khi mở modal
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      try {
        const res = await request(ApiEnum.GET_PART_CATEGORIES);
        const cats = Array.isArray(res)
          ? res
          : res?.success && Array.isArray(res.data)
          ? res.data
          : [];
        setCategories(cats);
      } catch (err) {
        toast.error("Failed to load part categories");
      } finally {
        setLoadingCats(false);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchModelsByCategory = async (category) => {
    if (!category) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const res = await request(ApiEnum.GET_PART_MODELS, { category });
      const list = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : [];
      setModels(list);
    } catch (err) {
      toast.error("Failed to load part models");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        oldTarget: "",
        target: "",
      }));
      return;
    }

    if (name === "targetCategory") {
      setFormData((prev) => ({
        ...prev,
        targetCategory: value,
        oldTarget: "",
        target: "",
      }));
      fetchModelsByCategory(value);
      return;
    }

    if (name === "oldTarget") {
      setFormData((prev) => ({
        ...prev,
        oldTarget: value,
        target: prev.target === value ? "" : prev.target,
      }));
      return;
    }

    if (name === "target") {
      setFormData((prev) => ({
        ...prev,
        target: value,
        oldTarget: prev.oldTarget === value ? "" : prev.oldTarget,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.type ||
      !formData.targetCategory ||
      !formData.oldTarget ||
      !formData.target ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.oldTarget === formData.target) {
      toast.error("Old Model and New Model must be different");
      return;
    }

    const payload = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      partModel: formData.oldTarget,
      replacementPartModel: formData.target,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    setPendingPayload(payload);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;
    try {
      setProcessing(true); // show overlay spinner
      await onSubmit(pendingPayload);
      setShowConfirm(false);
    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setProcessing(false);
      setPendingPayload(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingPayload(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Service Campaign"
      onClose={onClose}
      showFooter={false}
      size="lg"
    >
      {/* Overlay spinner đè lên confirm */}
      {processing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
            pointerEvents: "auto",
            backdropFilter: "blur(2px)",
          }}
        >
          <LoadingSpinner size="60px" />
          <p style={{ marginTop: 12, color: "#fff", fontSize: 18 }}>
            Creating…
          </p>
        </div>
      )}

      <form className="add-campaign-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Campaign Title *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter campaign title"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter campaign details..."
            className="form-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="" disabled>
                -- Select type --
              </option>
              <option value="Recall">Recall</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div className="form-group half">
            <label>Target Category *</label>
            {loadingCats ? (
              <LoadingSpinner />
            ) : (
              <select
                name="targetCategory"
                value={formData.targetCategory}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>
                  -- Select category --
                </option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Target Part Model (Old) *</label>
            {loadingModels ? (
              <LoadingSpinner />
            ) : (
              <select
                name="oldTarget"
                value={formData.oldTarget}
                onChange={handleChange}
                className="form-select"
                required
                disabled={!formData.targetCategory}
              >
                <option value="" disabled>
                  -- Select old part model --
                </option>
                {models
                  .filter((m) => m && m !== formData.target)
                  .map((m, idx) => (
                    <option key={idx} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="form-group half">
            <label>Target Part Model (New) *</label>
            {loadingModels ? (
              <LoadingSpinner />
            ) : (
              <select
                name="target"
                value={formData.target}
                onChange={handleChange}
                className="form-select"
                required
                disabled={!formData.targetCategory}
              >
                <option value="" disabled>
                  -- Select part model --
                </option>
                {models
                  .filter((m) => m && m !== formData.oldTarget)
                  .map((m, idx) => (
                    <option key={idx} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Start Date *</label>
            <Input
              type="date"
              name="startDate"
              min={minDate}
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group half">
            <label>End Date *</label>
            <Input
              type="date"
              name="endDate"
              min={minDate}
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={processing}>
            {processing ? "Creating…" : "Create Campaign & Notify Customers"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Campaign Creation"
        message="Are you sure you want to create this campaign and notify customers?"
        confirmLabel={
          processing ? <LoadingSpinner size="20px" /> : "Yes, Create"
        }
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
        confirmDisabled={processing}
        cancelDisabled={processing}
      />
    </Modal>
  );
};

AddCampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddCampaignModal;
