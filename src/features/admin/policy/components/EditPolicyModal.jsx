// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../../components/molecules/Modal/Modal";
// import { Button } from "../../../../components/atoms/Button/Button";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
// import "./PolicyModal.css";

// export const EditPolicyModal = ({
//   isOpen,
//   onClose,
//   policy,
//   onUpdate,
//   onDelete,
// }) => {
//   const [form, setForm] = useState({});
//   const pendingPayloadRef = React.useRef(null);
//   const [showConfirm, setShowConfirm] = React.useState(false);

//   useEffect(() => {
//     if (policy) setForm(policy);
//   }, [policy]);

//   // ensure status is present in form when modal opens
//   useEffect(() => {
//     if (policy) {
//       setForm((prev) => ({
//         ...(prev || {}),
//         status: policy.status ?? "Active",
//       }));
//     }
//   }, [policy]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     // Store pending payload and show confirmation dialog
//     pendingPayloadRef.current = form;
//     setShowConfirm(true);
//   };

//   const handleConfirmSave = async () => {
//     const payload = pendingPayloadRef.current;
//     setShowConfirm(false);
//     if (!payload) return;
//     try {
//       await onUpdate(payload);
//       pendingPayloadRef.current = null;
//     } catch (err) {
//       // Let container handle errors/toasts; keep form for user to correct
//       console.error("EditPolicyModal: update failed", err);
//     }
//   };

//   if (!policy) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Edit Policy"
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

//           <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
//             <Button
//               variant="danger"
//               onClick={() => {
//                 // delegate deletion to container (opens confirm dialog)
//                 onDelete?.();
//               }}
//             >
//               Delete
//             </Button>

//             <Button
//               variant="primary"
//               onClick={handleSubmit}
//               disabled={
//                 !(
//                   String(form.policyName || "").trim() !== "" &&
//                   String(form.conditions || "").trim() !== "" &&
//                   String(form.coveragePeriodMonths ?? "").trim() !== "" &&
//                   String(form.status || "").trim() !== ""
//                 )
//               }
//             >
//               Save Changes
//             </Button>
//           </div>
//         </div>
//       </div>
//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Save Changes"
//         message={`Are you sure you want to save changes to policy "${
//           form.policyName || "(no name)"
//         }"?`}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={handleConfirmSave}
//       />
//     </Modal>
//   );
// };

// EditPolicyModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   policy: PropTypes.object,
//   onUpdate: PropTypes.func.isRequired,
//   onDelete: PropTypes.func,
// };

// export default EditPolicyModal;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import "./PolicyModal.css";

export const EditPolicyModal = ({
  isOpen,
  onClose,
  policy,
  onUpdate,
  onDelete,
}) => {
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
          name="coveragePeriodMonths"
          value={form.coveragePeriodMonths || ""}
          onChange={handleChange}
        />

        {/* 🔥 Status đã bị xóa hoàn toàn */}

        <label>Conditions</label>
        <textarea
          name="conditions"
          value={form.conditions || ""}
          onChange={handleChange}
        />

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Button
              variant="danger"
              onClick={() => {
                onDelete?.();
              }}
            >
              Delete
            </Button>

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
            >
              Save Changes
            </Button>
          </div>
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
  onDelete: PropTypes.func,
};

export default EditPolicyModal;
