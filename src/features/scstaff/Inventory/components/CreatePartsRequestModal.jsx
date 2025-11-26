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
  const [currentQuantity, setCurrentQuantity] = useState("1"); // string
  const [addedParts, setAddedParts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [hasUserChangedCategory, setHasUserChangedCategory] = useState(false);

  // Reset states when modal opens and set preselected values
  useEffect(() => {
    if (isOpen) {
      setAddedParts([]);
      setCurrentModel(preselectedModel || "");
      setCurrentQuantity("1");
      setSelectedCategory(preselectedCategory || "");
      setError("");
      setHasUserChangedCategory(false);

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
    const qty = parseInt(currentQuantity);

    if (!currentModel) return setError("Please select a part model.");
    if (qty < 1) return setError("Quantity must be at least 1.");
    if (qty > 20) return setError("Quantity cannot exceed 20.");

    const updated = [...addedParts];
    updated.push({ model: currentModel, quantity: qty });

    setAddedParts(updated);
    setCurrentModel("");
    setCurrentQuantity("1");
    setError("");
  };

  const handleSubmit = () => {
    let finalParts = [...addedParts];
    const qty = parseInt(currentQuantity);

    if (currentModel && qty > 0) {
      if (qty > 20) return setError("Quantity cannot exceed 20.");
      finalParts.push({ model: currentModel, quantity: qty });
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
      size="lg"
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
                  setCurrentModel("");

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
                onChange={(e) => {
                  let val = e.target.value;

                  if (val === "") {
                    setCurrentQuantity("");
                    return;
                  }

                  let num = parseInt(val);
                  if (isNaN(num)) return;

                  if (num > 20) num = 20;
                  if (num < 1) num = 1;

                  setCurrentQuantity(num.toString());
                }}
                min="1"
                max="20"
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
