import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PolicyModal.css";

export const EditPolicyModal = ({ isOpen, onClose, policy, onUpdate }) => {
  const [form, setForm] = useState({});
  const pendingPayloadRef = React.useRef(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  useEffect(() => {
    if (policy) setForm(policy);
  }, [policy]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    pendingPayloadRef.current = form;
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    const payload = pendingPayloadRef.current;
    setShowConfirm(false);
    if (!payload) return;

    try {
      await onUpdate(payload);
      pendingPayloadRef.current = null;
    } catch (err) {
      console.error("EditPolicyModal: update failed", err);
    }
  };

  if (!policy) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Policy"
      size="lg"
      showFooter={false}
    >
      <div className="policy-form">
        <label>Policy Name</label>
        <input
          name="policyName"
          value={form.policyName || ""}
          onChange={handleChange}
        />

        <label>Coverage Period (Months)</label>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          pattern="[0-9]*"
          name="coveragePeriodMonths"
          value={form.coveragePeriodMonths || ""}
          onChange={(e) => {
            const raw = e.target.value;
            const digits = raw.replace(/\D/g, "");
            setForm({ ...form, coveragePeriodMonths: digits });
          }}
          onKeyDown={(e) => {
            const allowed = [
              "Backspace",
              "Delete",
              "ArrowLeft",
              "ArrowRight",
              "Tab",
              "Enter",
              "Home",
              "End",
            ]; // không cho -, e, .
            if (allowed.includes(e.key) || /[0-9]/.test(e.key)) return;
            e.preventDefault();
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (!/^\d+$/.test(text)) e.preventDefault();
          }}
        />

        <label>Conditions</label>
        <textarea
          name="conditions"
          value={form.conditions || ""}
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          {/* Cancel bên trái */}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {/* Save bên phải */}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              !(
                String(form.policyName || "").trim() !== "" &&
                String(form.conditions || "").trim() !== "" &&
                String(form.coveragePeriodMonths || "").trim() !== ""
              )
            }
            style={{ marginLeft: "auto" }}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Save Changes"
        message={`Are you sure you want to save changes to policy "${
          form.policyName || "(no name)"
        }"?`}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
      />
    </Modal>
  );
};

EditPolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default EditPolicyModal;
