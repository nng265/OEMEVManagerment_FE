// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../components/molecules/Modal/Modal";
// import { DetailSection } from "../../../components/molecules/DetailSection/DetailSection";
// import { DetailModalActions } from "../../../components/molecules/DetailModalActions/DetailModalActions";
// import { Button } from "../../../components/atoms/Button/Button";
// import { Input } from "../../../components/atoms/Input/Input"; // Assuming you have an Input component that can be a select dropdown
// import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
// import "./CreatePartsRequestModal.css";

// export const CreatePartsRequestModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   fetchPartModels, // Function passed from container to get models
//   isLoadingModels = false, // Loading state for models
//   availableModels = [], // Array of models like [{ value: 'model_id', label: 'Model Name' }]
//   isSubmitting = false,
//   preselectedModel = "",
//   fetchPartModelsByCategory, // 👈 thêm
//   categories = [], // 👈 thêm
// }) => {
//   // State for the current part being added
//   const [currentModel, setCurrentModel] = useState("");
//   const [currentQuantity, setCurrentQuantity] = useState(1);
//   // State for the list of parts added to the request
//   const [addedParts, setAddedParts] = useState([]);
//   const [error, setError] = useState("");

//     const [selectedCategory, setSelectedCategory] = useState("");
//   // const [availableModels, setAvailableModels] = useState([]);

//   // Fetch models when the modal opens
//   useEffect(() => {
//     if (isOpen) {
//       fetchPartModels();
//       setAddedParts([]);
//       setCurrentModel(preselectedModel || ""); // 👈 TỰ CHỌN MODEL TRUYỀN TỪ NGOÀI
//       setCurrentQuantity(1);
//       setError("");
//        setSelectedCategory("");
//       // setAvailableModels([]);
//     }
//   }, [isOpen, fetchPartModels, preselectedModel]);

//   const handleAddModelChange = (e) => {
//     setCurrentModel(e.target.value);
//     setError(""); // Clear error on change
//   };

//   const handleQuantityChange = (e) => {
//     const value = parseInt(e.target.value, 10);
//     // Ensure quantity is at least 1
//     setCurrentQuantity(isNaN(value) || value < 1 ? 1 : value);
//     setError(""); // Clear error on change
//   };

//   const handleAddPart = () => {
//     setError(""); // Clear previous errors
//     if (!currentModel) {
//       setError("Please select a part model.");
//       return;
//     }
//     if (currentQuantity < 1) {
//       setError("Quantity must be at least 1.");
//       return;
//     }

//     // Check if model already added
//     const existingPartIndex = addedParts.findIndex(
//       (part) => part.model === currentModel
//     );

//     if (existingPartIndex !== -1) {
//       // Option 1: Alert user and don't add

//       // Option 2: Update quantity of existing part
//       const updatedParts = [...addedParts];
//       updatedParts[existingPartIndex].quantity += currentQuantity;
//       setAddedParts(updatedParts);
//     } else {
//       // Add new part to the list
//       setAddedParts([
//         ...addedParts,
//         { model: currentModel, quantity: currentQuantity },
//       ]);
//     }

//     // Reset inputs for the next part
//     setCurrentModel("");
//     setCurrentQuantity(1);
//   };

//   const handleRemovePart = (modelToRemove) => {
//     setAddedParts(addedParts.filter((part) => part.model !== modelToRemove));
//   };

//   const handleSubmit = () => {
//     // Nếu có phần đang chọn mà chưa bấm Add
//     let finalParts = [...addedParts];
//     if (currentModel && currentQuantity > 0) {
//       const existingIndex = finalParts.findIndex(
//         (p) => p.model === currentModel
//       );
//       if (existingIndex !== -1) {
//         // Gộp số lượng nếu model trùng
//         finalParts[existingIndex].quantity += currentQuantity;
//       } else {
//         finalParts.push({ model: currentModel, quantity: currentQuantity });
//       }
//     }

//     if (finalParts.length === 0) {
//       setError("Please add or select at least one part to request.");
//       return;
//     }

//     // Gửi về container
//     onSubmit(finalParts);
//   };

//   console.log("Available models in modal:", availableModels);

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Create Parts Request"
//       size="md" // Medium size might be suitable
//       showFooter={false} // Use custom footer with DetailModalActions
//     >
//       {/* Section to display already added parts */}
//       {addedParts.length > 0 && (
//         <DetailSection title="Parts Added to Request">
//           <div className="added-parts-list">
//             {addedParts.map((part) => (
//               <div className="added-part-item" key={part.model}>
//                 <span>
//                   {part.model} (Qty: {part.quantity})
//                 </span>
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   onClick={() => handleRemovePart(part.model)}
//                   className="remove-part-btn"
//                 >
//                   Remove
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </DetailSection>
//       )}

//       {/* Section to add new parts */}
//       <DetailSection title="Add Parts to Request">
//         {isLoadingModels ? (
//           <LoadingSpinner />
//         ) : (
//           <div className="add-part-form">
//             <div className="form-row">
//               {/* Assuming Input can render a select */}
//               <Input
//                 type="select" // Use select type for your Input component
//                 label="Part Model"
//                 name="partModel"
//                 value={currentModel}
//                 onChange={handleAddModelChange}
//                 required
//                 options={[
//                   // Add a placeholder option
//                   { value: "", label: "Select part model", disabled: true },
//                   ...availableModels, // Spread the models from props
//                 ]}
//                 className="part-model-select"
//               />
//               <Input
//                 type="number"
//                 label="Quantity"
//                 name="quantity"
//                 value={currentQuantity}
//                 onChange={handleQuantityChange}
//                 min="1"
//                 required
//                 className="quantity-input"
//               />
//             </div>
//             <Button
//               variant="secondary"
//               onClick={handleAddPart}
//               fullWidth
//               className="add-part-btn"
//             >
//               + Add Part
//             </Button>
//           </div>
//         )}
//       </DetailSection>

//       {/* Error Message */}
//       {error && <div className="modal-error-message">{error}</div>}
//       {/* Modal Actions */}
//       <DetailModalActions onBack={onClose} backLabel="Cancel">
//         <Button
//           variant="primary"
//           onClick={handleSubmit}
//           isLoading={isSubmitting}
//           disabled={isLoadingModels}
//         >
//           Submit Request
//         </Button>
//       </DetailModalActions>
//     </Modal>
//   );
// };

// CreatePartsRequestModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
//   fetchPartModels: PropTypes.func.isRequired,
//   isLoadingModels: PropTypes.bool,
//   availableModels: PropTypes.arrayOf(
//     PropTypes.shape({
//       value: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//       disabled: PropTypes.bool, // Optional for placeholder
//     })
//   ),
//   isSubmitting: PropTypes.bool,
//   preselectedModel: PropTypes.string,
// };

// export default CreatePartsRequestModal;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../components/molecules/DetailModalActions/DetailModalActions";
import { Button } from "../../../components/atoms/Button/Button";
import { Input } from "../../../components/atoms/Input/Input";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner/LoadingSpinner";
import "./CreatePartsRequestModal.css";

export const CreatePartsRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  fetchPartModelsByCategory,
  fetchAllPartModels,
  isLoadingModels = false,
  availableModels = [],
  categories = [],
  isSubmitting = false,
  preselectedCategory = "",
  preselectedModel = "",
}) => {
  const [currentModel, setCurrentModel] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [addedParts, setAddedParts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [hasUserChangedCategory, setHasUserChangedCategory] = useState(false);

  // Reset states when modal opens and set preselected values
  useEffect(() => {
    if (isOpen) {
      setAddedParts([]);
      setCurrentModel(preselectedModel || "");
      setCurrentQuantity(1);
      setSelectedCategory(preselectedCategory || "");
      setError("");
      setHasUserChangedCategory(false);

      // If preselected category exists, fetch its models
      if (preselectedCategory) {
        fetchPartModelsByCategory(preselectedCategory);
      }
    }
  }, [
    isOpen,
    preselectedCategory,
    preselectedModel,
    fetchPartModelsByCategory,
  ]);

  const handleAddPart = () => {
    if (!currentModel) return setError("Please select a part model.");
    if (currentQuantity < 1) return setError("Quantity must be at least 1.");

    const existing = addedParts.findIndex((p) => p.model === currentModel);
    const updated = [...addedParts];

    if (existing !== -1) {
      updated[existing].quantity += currentQuantity;
    } else {
      updated.push({ model: currentModel, quantity: currentQuantity });
    }

    setAddedParts(updated);
    setCurrentModel("");
    setCurrentQuantity(1);
  };

  const handleSubmit = () => {
    const finalParts = [...addedParts];
    if (currentModel && currentQuantity > 0) {
      const exists = finalParts.findIndex((p) => p.model === currentModel);
      if (exists !== -1) finalParts[exists].quantity += currentQuantity;
      else finalParts.push({ model: currentModel, quantity: currentQuantity });
    }

    if (finalParts.length === 0)
      return setError("Please add at least one part to request.");

    onSubmit(finalParts);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Parts Request"
      size="md"
      showFooter={false}
    >
      {addedParts.length > 0 && (
        <DetailSection title="Parts Added to Request">
          <div className="added-parts-list">
            {addedParts.map((p) => (
              <div className="added-part-item" key={p.model}>
                <span>
                  {p.model} (Qty: {p.quantity})
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    setAddedParts(addedParts.filter((x) => x.model !== p.model))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      <DetailSection title="Add Parts to Request">
        {isLoadingModels ? (
          <LoadingSpinner />
        ) : (
          <div className="add-part-form">
            <div className="form-row">
              <Input
                type="select"
                label="Category"
                name="category"
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  setHasUserChangedCategory(true);

                  // Clear preselected model when user changes category
                  setCurrentModel("");

                  // Only fetch models when a category is selected
                  if (newCategory) {
                    fetchPartModelsByCategory(newCategory);
                  }
                }}
                options={[
                  {
                    value: "",
                    label: "-- Select category first --",
                    disabled: true,
                  },
                  ...categories.map((c) => ({
                    value: c,
                    label: c,
                  })),
                ]}
              />

              <Input
                type="select"
                label="Part Model"
                name="partModel"
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                required
                disabled={!selectedCategory}
                options={[
                  {
                    value: "",
                    label: selectedCategory
                      ? "Select part model"
                      : "Select category first",
                    disabled: true,
                  },
                  ...availableModels,
                ]}
              />

              <Input
                type="number"
                label="Quantity"
                name="quantity"
                value={currentQuantity}
                onChange={(e) =>
                  setCurrentQuantity(parseInt(e.target.value) || 1)
                }
                min="1"
                required
              />
            </div>
            <Button variant="secondary" onClick={handleAddPart} fullWidth>
              + Add Part
            </Button>
          </div>
        )}
      </DetailSection>

      {error && <div className="modal-error-message">{error}</div>}

      <DetailModalActions onBack={onClose} backLabel="Cancel">
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isLoadingModels}
        >
          Submit Request
        </Button>
      </DetailModalActions>
    </Modal>
  );
};

CreatePartsRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  fetchAllPartModels: PropTypes.func.isRequired,
  fetchPartModelsByCategory: PropTypes.func.isRequired,
  availableModels: PropTypes.array,
  isLoadingModels: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  categories: PropTypes.array,
  preselectedCategory: PropTypes.string,
  preselectedModel: PropTypes.string,
};
