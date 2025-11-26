// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Modal } from "../../../../components/molecules/Modal/Modal";
// import { Button } from "../../../../components/atoms/Button/Button"; // <-- Khôi phục lại Button
// import { toast } from "react-toastify";
// import "./AccountModal.css";
// import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

// const ROLES = ["SC_STAFF", "SC_TECH", "EVM_STAFF", "ADMIN"];

// export const EditAccountModal = ({
//   isOpen,
//   onClose,
//   account,
//   onUpdate,
//   // onDelete,
//   organizations = [],
// }) => {
//   const [form, setForm] = useState({});
//   const [showConfirm, setShowConfirm] = useState(false);
//   const pendingPayloadRef = React.useRef(null);

//   useEffect(() => {
//     if (account) {
//       setForm({
//         email: account.email || "",
//         role: account.role || "",
//         orgId: account.orgId || "",
//       });
//     }
//   }, [account]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Đổi tên: Sẽ được gọi bởi nút 'Save Changes'
//   const handleSubmit = () => {
//     if (!form.email || !form.role || !form.orgId) {
//       toast.error("Please fill in all fields.");
//       return;
//     }
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
//       console.error("EditAccountModal: update failed", err);
//     }
//   };

//   if (!account) return null;

//   return (
//     <>
//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         title="Edit Account"
//         size="lg"
//         showFooter={false} // <-- SỬA: Chúng ta tự tạo footer, nên TẮT footer gốc
//       >
//         {/* ----- NỘI DUNG FORM ----- */}
//         <div className="account-form">
//           <label>Email</label>
//           <input
//             name="email"
//             value={form.email || ""}
//             onChange={handleChange}
//           />

//           <label>Role</label>
//           <select name="role" value={form.role || ""} onChange={handleChange}>
//             <option value="" disabled>
//               -- Select a role --
//             </option>
//             {ROLES.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>

//           <label>Organization</label>
//           <select name="orgId" value={form.orgId || ""} onChange={handleChange}>
//             <option value="" disabled>
//               -- Select an organization --
//             </option>
//             {organizations.map((org) => (
//               <option key={org.orgId} value={org.orgId}>
//                 {org.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
//           <Button variant="secondary" onClick={onClose}>
//             Cancel
//           </Button>

//           <Button
//             variant="primary"
//             onClick={handleSubmit}
//             style={{ marginLeft: "auto" }}
//           >
//             Save Changes
//           </Button>
//         </div>
//       </Modal>

//       <ConfirmDialog
//         isOpen={showConfirm}
//         title="Save Changes"
//         message={`Are you sure you want to save changes to ${form.email}?`}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={handleConfirmSave}
//       />
//     </>
//   );
// };

// EditAccountModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   account: PropTypes.object,
//   onUpdate: PropTypes.func.isRequired,
//   // onDelete: PropTypes.func,
//   organizations: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

// export default EditAccountModal;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { toast } from "react-toastify";
import "./AccountModal.css";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

const ROLES = ["SC_STAFF", "SC_TECH", "EVM_STAFF", "ADMIN"];

export const EditAccountModal = ({
  isOpen,
  onClose,
  account,
  onUpdate,
  organizations = [],
}) => {
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const pendingPayloadRef = React.useRef(null);

  useEffect(() => {
    if (account) {
      setForm({
        email: account.email || "",
        role: account.role || "",
        orgId: account.orgId || "",
        password: "********", // fake để hiển thị
        confirmPassword: "", // luôn trống
      });
    }
  }, [account]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.email || !form.role || !form.orgId) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Nếu người dùng nhập password, kiểm tra khớp confirm
    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    pendingPayloadRef.current = form;
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    const payload = pendingPayloadRef.current;
    setShowConfirm(false);
    if (!payload) return;

    // Build body để gửi API
    const body = {
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
    };

    // Gửi password nếu user thực sự đổi
    if (payload.password && payload.password !== "********") {
      body.password = payload.password;
      body.confirmPassword = payload.confirmPassword;
    }

    try {
      await onUpdate(body);
      pendingPayloadRef.current = null;
    } catch (err) {
      console.error("EditAccountModal: update failed", err);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Account"
        size="lg"
        showFooter={false}
      >
        <div className="account-form">
          <label>Email</label>
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password || ""}
            onChange={handleChange}
            placeholder="Leave blank if not changing"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword || ""}
            onChange={handleChange}
            placeholder="Leave blank if not changing"
          />

          <label>Role</label>
          <select name="role" value={form.role || ""} onChange={handleChange}>
            <option value="" disabled>
              -- Select a role --
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label>Organization</label>
          <select name="orgId" value={form.orgId || ""} onChange={handleChange}>
            <option value="" disabled>
              -- Select an organization --
            </option>
            {organizations.map((org) => (
              <option key={org.orgId} value={org.orgId}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            style={{ marginLeft: "auto" }}
          >
            Save Changes
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Save Changes"
        message={`Are you sure you want to save changes to ${form.email}?`}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
      />
    </>
  );
};

EditAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default EditAccountModal;
