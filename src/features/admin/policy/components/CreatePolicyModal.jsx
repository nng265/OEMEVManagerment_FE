// import React, { useState } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../../components/molecules/Modal/Modal";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import { toast } from "react-toastify";
// import "./PolicyModal.css";

// export const CreatePolicyModal = ({ isOpen, onClose, onCreate }) => {
//   const initialForm = {
//     policyName: "",
//     conditions: "",
//     coveragePeriodMonths: "",
//   };

//   const [form, setForm] = useState(initialForm);

//   const pendingPayloadRef = React.useRef(null);
//   const [showConfirm, setShowConfirm] = React.useState(false);

//   // Reset form whenever modal is opened to ensure no leftover data
//   React.useEffect(() => {
//     if (isOpen) setForm(initialForm);
//   }, [isOpen]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     const nameVal = String(form.policyName || "").trim();
//     const conditionsVal = String(form.conditions || "").trim();
//     const coverageRaw = String(form.coveragePeriodMonths ?? "").trim();
//     const coverageVal = coverageRaw === "" ? NaN : parseInt(coverageRaw, 10);

//     if (!nameVal) {
//       toast.error("Policy Name is required");
//       return;
//     }

//     if (!conditionsVal) {
//       toast.error("Conditions is required");
//       return;
//     }

//     // Require coverage period to be provided (cannot be empty)
//     if (Number.isNaN(coverageVal)) {
//       toast.error("Coverage Period (Months) is required");
//       return;
//     }

//     // Build envelope with `request` and use null for nullable GUIDs
//     const payload = {
//       request: {
//         policyId: null,
//         name: nameVal,
//         coveragePeriodMonths: coverageVal,
//         orgId: null,
//         // default created policies to Active when status isn't chosen by user
//         status: "Active",
//         conditions: conditionsVal,
//       },
//     };

//     // store payload and show confirm dialog
//     pendingPayloadRef.current = payload;
//     setShowConfirm(true);
//   };

//   // Disable Create button until all required fields are filled
//   const isFormValid =
//     String(form.policyName || "").trim() !== "" &&
//     String(form.conditions || "").trim() !== "" &&
//     String(form.coveragePeriodMonths ?? "").trim() !== "";

//   const handleConfirmCreate = async () => {
//     const payload = pendingPayloadRef.current;
//     setShowConfirm(false);
//     if (!payload) return;
//     try {
//       await onCreate(payload);
//       // clear pending and form
//       pendingPayloadRef.current = null;
//       setForm(initialForm);
//     } catch (err) {
//       // create failed; keep form for user to correct. Container handles toasts.
//       console.error("CreatePolicyModal: create failed", err);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Create Policy"
//       size="lg"
//       showFooter={false}
//     >
//       <div className="policy-form">
//         <label>Policy Name</label>
//         <input
//           name="policyName"
//           value={form.policyName}
//           onChange={handleChange}
//         />

//         <label>Coverage Period (Months)</label>
//         <input
//           type="number"
//           min="0"
//           name="coveragePeriodMonths"
//           value={form.coveragePeriodMonths}
//           onChange={handleChange}
//         />

//         <label>Status</label>
//         <select
//           name="status"
//           value={form.status ?? "Active"}
//           onChange={handleChange}
//         >
//           <option value="Active">Active</option>
//           <option value="Inactive">Inactive</option>
//         </select>

//         <label>Conditions</label>
//         <textarea
//           name="conditions"
//           value={form.conditions}
//           onChange={handleChange}
//         />

//         <div className="modal-footer">
//           <Button variant="secondary" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleSubmit}
//             disabled={!isFormValid}
//           >
//             Create
//           </Button>
//         </div>
//       </div>
//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Create Policy"
//         message={`Are you sure you want to create policy "${
//           form.policyName || "(no name)"
//         }"?`}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={handleConfirmCreate}
//       />
//     </Modal>
//   );
// };

// CreatePolicyModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onCreate: PropTypes.func.isRequired,
// };

// export default CreatePolicyModal;

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import "./PolicyModal.css";

export const CreatePolicyModal = ({ isOpen, onClose, onCreate }) => {
  const initialForm = {
    policyName: "",
    conditions: "",
    coveragePeriodMonths: "",
  };

  const [form, setForm] = useState(initialForm);

  const pendingPayloadRef = React.useRef(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) setForm(initialForm);
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const nameVal = String(form.policyName || "").trim();
    const conditionsVal = String(form.conditions || "").trim();
    const coverageRaw = String(form.coveragePeriodMonths ?? "").trim();
    const coverageVal = coverageRaw === "" ? NaN : parseInt(coverageRaw, 10);

    if (!nameVal) {
      toast.error("Policy Name is required");
      return;
    }

    if (!conditionsVal) {
      toast.error("Conditions is required");
      return;
    }

    if (Number.isNaN(coverageVal)) {
      toast.error("Coverage Period (Months) is required");
      return;
    }

    // FE không gửi status
    const payload = {
      request: {
        policyId: null,
        name: nameVal,
        coveragePeriodMonths: coverageVal,
        orgId: null,
        conditions: conditionsVal,
      },
    };

    pendingPayloadRef.current = payload;
    setShowConfirm(true);
  };

  const isFormValid =
    String(form.policyName || "").trim() !== "" &&
    String(form.conditions || "").trim() !== "" &&
    String(form.coveragePeriodMonths ?? "").trim() !== "";

  const handleConfirmCreate = async () => {
    const payload = pendingPayloadRef.current;
    setShowConfirm(false);
    if (!payload) return;

    try {
      await onCreate(payload);
      pendingPayloadRef.current = null;
      setForm(initialForm);
    } catch (err) {
      console.error("CreatePolicyModal: create failed", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Policy"
      size="lg"
      showFooter={false}
    >
      <div className="policy-form">
        <label>Policy Name</label>
        <input
          name="policyName"
          value={form.policyName}
          onChange={handleChange}
        />

        <label>Coverage Period (Months)</label>
        <input
          type="number"
          min="0"
          name="coveragePeriodMonths"
          value={form.coveragePeriodMonths}
          onChange={handleChange}
        />

        {/* Removed Status completely */}

        <label>Conditions</label>
        <textarea
          name="conditions"
          value={form.conditions}
          onChange={handleChange}
        />

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Create
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Create Policy"
        message={`Are you sure you want to create policy "${
          form.policyName || "(no name)"
        }"?`}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmCreate}
      />
    </Modal>
  );
};

CreatePolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CreatePolicyModal;
