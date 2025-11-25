// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import "./AddPartOrder.css";

// export default function AddPartOrder({
//   isOpen,
//   onClose,
//   onSubmit,
//   centers,
//   loadingCenters,
//   centersError,

//   categories,
//   loadingCategories,
//   modelsByCategory,
//   loadingCategoryModels,
//   onFetchModelsByCategory,
// }) {
//   const [items, setItems] = useState([
//     { category: "", model: "", quantity: 1 },
//   ]);
//   const [receiver, setReceiver] = useState("");
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   // --------------------------------------------------------------
//   // RESET STATE KHI MỞ MODAL
//   // --------------------------------------------------------------
//   useEffect(() => {
//     if (isOpen) {
//       setItems([{ category: "", model: "", quantity: 1 }]);
//       setReceiver("");
//       setError("");
//       setShowConfirm(false);
//     }
//   }, [isOpen]);

//   // --------------------------------------------------------------
//   // HELPER FUNCTIONS
//   // --------------------------------------------------------------
//   const updateItem = (idx, patch) => {
//     setItems((prev) =>
//       prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
//     );
//   };

//   const addRow = () =>
//     setItems((prev) => [...prev, { category: "", model: "", quantity: 1 }]);

//   const removeRow = (idx) =>
//     setItems((prev) => prev.filter((_, i) => i !== idx));

//   // --------------------------------------------------------------
//   // VALIDATION
//   // --------------------------------------------------------------
//   const validate = () => {
//     if (!receiver) return "Please select a receiving center.";
//     if (!items.length) return "Please add at least 1 part.";

//     for (const it of items) {
//       if (!it.category) return "Each part must have a category.";
//       if (!it.model) return "Each part must have a model.";
//       if (!it.quantity || it.quantity < 1) return "Quantity must be >= 1.";
//     }
//     return "";
//   };

//   const handlePrepare = () => {
//     const err = validate();
//     if (err) return setError(err);
//     setShowConfirm(true);
//   };

//   // --------------------------------------------------------------
//   // SUBMIT
//   // --------------------------------------------------------------
//   const performCreate = async () => {
//     const err = validate();
//     if (err) return setError(err);

//     setSubmitting(true);
//     try {
//       await onSubmit?.({ receiver, items });
//       onClose();
//     } catch (err) {
//       console.error(err);
//       setError("Unable to create part order.");
//     } finally {
//       setSubmitting(false);
//       setShowConfirm(false);
//     }
//   };

//   // --------------------------------------------------------------
//   // RENDER
//   // --------------------------------------------------------------
//   if (!isOpen) return null;

//   return (
//     <>
//       <div
//         className="pl-overlay"
//         onClick={(e) => e.target === e.currentTarget && onClose()}
//       >
//         <div className="pl-container add-part-order">
//           {/* HEADER */}
//           <div className="pl-header">
//             <h3 style={{ fontSize: 30 }}>Create Part Order</h3>
//             <button className="pl-close-btn" onClick={onClose}>
//               ×
//             </button>
//           </div>

//           {/* BODY */}
//           <div className="pl-content">
//             {/* RECEIVING CENTER */}
//             <div className="pl-info-row">
//               <strong>Receiving Center:</strong>

//               {loadingCenters ? (
//                 <LoadingSpinner size="sm" />
//               ) : (
//                 <select
//                   className="po-input"
//                   value={receiver}
//                   onChange={(e) => setReceiver(e.target.value)}
//                 >
//                   <option value="">-- Select Center --</option>
//                   {centers.map((c) => (
//                     <option key={c.value} value={c.value}>
//                       {c.label}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>

//             {/* PARTS TABLE */}
//             <h3 style={{ marginTop: 4 }}>Parts</h3>

//             <div className="po-items">
//               {items.map((it, idx) => {
//                 const modelList = modelsByCategory[it.category] || [];
//                 const loadingModel = loadingCategoryModels[it.category];

//                 return (
//                   <div key={idx} className="po-row">
//                     {/* CATEGORY */}
//                     <select
//                       className="po-input category"
//                       value={it.category}
//                       onChange={async (e) => {
//                         const category = e.target.value;

//                         updateItem(idx, { category, model: "" });

//                         if (category) {
//                           await onFetchModelsByCategory?.(category);
//                         }
//                       }}
//                     >
//                       <option value="">-- Category --</option>
//                       {categories.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>

//                     {/* MODEL */}
//                     <select
//                       className="po-input model"
//                       disabled={!it.category || loadingModel}
//                       value={it.model}
//                       onChange={(e) =>
//                         updateItem(idx, { model: e.target.value })
//                       }
//                     >
//                       <option value="">
//                         {!it.category
//                           ? "-- Select Category First --"
//                           : loadingModel
//                           ? "Loading..."
//                           : "-- Select Model --"}
//                       </option>

//                       {modelList.map((m) => (
//                         <option key={m.value} value={m.value}>
//                           {m.label}
//                         </option>
//                       ))}
//                     </select>

//                     {/* QTY */}
//                     <input
//                       type="number"
//                       min="1"
//                       className="po-input qty"
//                       value={it.quantity}
//                       onChange={(e) =>
//                         updateItem(idx, { quantity: Number(e.target.value) })
//                       }
//                     />

//                     {/* REMOVE */}
//                     {items.length > 1 && (
//                       <button
//                         className="po-remove-btn"
//                         onClick={() => removeRow(idx)}
//                       >
//                         —
//                       </button>
//                     )}
//                   </div>
//                 );
//               })}

//               {/* ADD ROW */}
//               <button className="po-add-btn" onClick={addRow}>
//                 + Add Part
//               </button>
//             </div>

//             {/* ERROR */}
//             {error && <div className="po-error">{error}</div>}

//             {/* FOOTER */}
//             <div
//               className="pl-footer"
//               style={{ display: "flex", justifyContent: "space-between" }}
//             >
//               <Button
//                 className="pl-btn-secondary pl-btn-cancel"
//                 onClick={onClose}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>

//               <Button onClick={handlePrepare} disabled={submitting}>
//                 Prepare
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CONFIRM DIALOG */}
//       <ConfirmDialog
//         isOpen={showConfirm}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={performCreate}
//         title="Confirm Create Part Order"
//         message="Are you sure you want to create this part order?"
//         loading={submitting}
//       />
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./AddPartOrder.css";

export default function AddPartOrder({
  isOpen,
  onClose,
  onSubmit,
  centers,
  loadingCenters,
  centersError,

  categories,
  loadingCategories,
  modelsByCategory,
  loadingCategoryModels,
  onFetchModelsByCategory,
}) {
  const [items, setItems] = useState([
    { category: "", model: "", quantity: 1 },
  ]);
  const [receiver, setReceiver] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------------------
  // RESET STATE KHI MỞ MODAL
  // --------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      setItems([{ category: "", model: "", quantity: 1 }]);
      setReceiver("");
      setError("");
      setShowConfirm(false);
    }
  }, [isOpen]);

  // --------------------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------------------
  const updateItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  };

  const addRow = () =>
    setItems((prev) => [...prev, { category: "", model: "", quantity: 1 }]);

  const removeRow = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  // --------------------------------------------------------------
  // VALIDATION
  // --------------------------------------------------------------
  const validate = () => {
    if (!receiver) return "Please select a receiving center.";
    if (!items.length) return "Please add at least 1 part.";

    for (const it of items) {
      if (!it.category) return "Each part must have a category.";
      if (!it.model) return "Each part must have a model.";
      if (!it.quantity || it.quantity < 1) return "Quantity must be >= 1.";
    }
    return "";
  };

  const handlePrepare = () => {
    const err = validate();
    if (err) return setError(err);
    setShowConfirm(true);
  };

  // --------------------------------------------------------------
  // SUBMIT
  // --------------------------------------------------------------
  const performCreate = async () => {
    const err = validate();
    if (err) return setError(err);

    setSubmitting(true);
    try {
      await onSubmit?.({ receiver, items });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unable to create part order.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  if (!isOpen) return null;

  // ---------- Tính các giá trị đã chọn để loại khỏi dropdown ----------
  const selectedCategories = items.map((it) => it.category).filter(Boolean);
  const selectedModels = items.map((it) => it.model).filter(Boolean);
  const selectedCenters = receiver ? [receiver] : [];

  return (
    <>
      <div
        className="pl-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="pl-container add-part-order">
          {/* HEADER */}
          <div className="pl-header">
            <h3 style={{ fontSize: 30 }}>Create Part Order</h3>
            <button className="pl-close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="pl-content">
            {/* RECEIVING CENTER */}
            <div className="pl-info-row">
              <strong>Receiving Center:</strong>

              {loadingCenters ? (
                <LoadingSpinner size="sm" />
              ) : (
                <select
                  className="po-input"
                  value={receiver}
                  title={
                    receiver
                      ? `Selected: ${receiver}`
                      : "Select receiving center"
                  }
                  onChange={(e) => setReceiver(e.target.value)}
                >
                  <option value="">-- Select Center --</option>
                  {centers
                    .filter(
                      (c) =>
                        !selectedCenters.includes(c.value) ||
                        c.value === receiver
                    )
                    .map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* PARTS TABLE */}
            <h3 style={{ marginTop: 4 }}>Parts</h3>

            <div className="po-items">
              {items.map((it, idx) => {
                const modelList = modelsByCategory[it.category] || [];
                const loadingModel = loadingCategoryModels[it.category];

                // Lọc options đã chọn ở các row khác
                const availableCategories = categories.filter(
                  (c) => !selectedCategories.includes(c) || c === it.category
                );
                const availableModels = modelList.filter(
                  (m) =>
                    !selectedModels.includes(m.value) || m.value === it.model
                );

                return (
                  <div key={idx} className="po-row">
                    {/* CATEGORY */}
                    <select
                      className="po-input category"
                      value={it.category}
                      title={
                        it.category
                          ? `Selected: ${it.category}`
                          : "Select category"
                      }
                      onChange={async (e) => {
                        const category = e.target.value;
                        updateItem(idx, { category, model: "" });
                        if (category) await onFetchModelsByCategory?.(category);
                      }}
                    >
                      <option value="">-- Category --</option>
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* MODEL */}
                    <select
                      className="po-input model"
                      disabled={!it.category || loadingModel}
                      value={it.model}
                      title={
                        it.model ? `Selected: ${it.model}` : "Select model"
                      }
                      onChange={(e) =>
                        updateItem(idx, { model: e.target.value })
                      }
                    >
                      <option value="">
                        {!it.category
                          ? "-- Select Category First --"
                          : loadingModel
                          ? "Loading..."
                          : "-- Select Model --"}
                      </option>
                      {availableModels.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    {/* QTY */}
                    <input
                      type="number"
                      min="1"
                      className="po-input qty"
                      value={it.quantity}
                      title={`Quantity: ${it.quantity}`}
                      onChange={(e) =>
                        updateItem(idx, { quantity: Number(e.target.value) })
                      }
                    />

                    {/* REMOVE */}
                    {items.length > 1 && (
                      <button
                        className="po-remove-btn"
                        onClick={() => removeRow(idx)}
                      >
                        —
                      </button>
                    )}
                  </div>
                );
              })}

              {/* ADD ROW */}
              <button className="po-add-btn" onClick={addRow}>
                + Add Part
              </button>
            </div>

            {/* ERROR */}
            {error && <div className="po-error">{error}</div>}

            {/* FOOTER */}
            <div
              className="pl-footer"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Button
                className="pl-btn-secondary pl-btn-cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button onClick={handlePrepare} disabled={submitting}>
                Prepare
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={performCreate}
        title="Confirm Create Part Order"
        message="Are you sure you want to create this part order?"
        loading={submitting}
      />
    </>
  );
}
