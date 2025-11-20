import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { DetailModalActions } from "../../../../components/molecules/DetailModalActions/DetailModalActions";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import { LoadingSpinner } from "../../../../components/atoms/LoadingSpinner/LoadingSpinner";
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
      size="xl"
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
