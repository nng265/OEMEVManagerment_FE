import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";
import "./AccountModal.css"; // Dùng chung CSS

// Định nghĩa các Role
const ROLES = ["SC_STAFF", "SC_TECH", "EVM_STAFF", "ADMIN"];

// Đổi tên component
export const CreateAccountModal = ({
  isOpen,
  onClose,
  onCreate,
  organizations = [], // Thêm prop 'organizations'
}) => {
  // Đổi state ban đầu
  const initialForm = {
    email: "",
    passwordHash: "",
    name: "",
    role: "",
    orgId: "",
  };

  const [form, setForm] = useState(initialForm);

  const pendingPayloadRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset form khi modal mở
  useEffect(() => {
    if (isOpen) setForm(initialForm);
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Đổi logic submit
  const handleSubmit = async () => {
    const emailVal = String(form.email || "").trim();
    const passwordVal = String(form.passwordHash || "").trim();
    const nameVal = String(form.name || "").trim();
    const roleVal = String(form.role || "").trim();
    const orgIdVal = String(form.orgId || "").trim();

    if (!emailVal) {
      toast.error("Email is required");
      return;
    }
    if (!passwordVal) {
      toast.error("Password is required");
      return;
    }
    if (!nameVal) {
      toast.error("Name is required");
      return;
    }
    if (!roleVal) {
      toast.error("Role is required");
      return;
    }
    if (!orgIdVal) {
      toast.error("Organization is required");
      return;
    }

    // Đổi Payload cho Account
    const payload = {
      email: emailVal,
      passwordHash: passwordVal,
      name: nameVal,
      role: roleVal,
      orgId: orgIdVal,
    };

    pendingPayloadRef.current = payload;
    setShowConfirm(true);
  };

  // Đổi logic kiểm tra form
  const isFormValid =
    String(form.email || "").trim() !== "" &&
    String(form.passwordHash || "").trim() !== "" &&
    String(form.name || "").trim() !== "" &&
    String(form.role || "").trim() !== "" &&
    String(form.orgId || "").trim() !== "";

  const handleConfirmCreate = async () => {
    const payload = pendingPayloadRef.current;
    setShowConfirm(false);
    if (!payload) return;

    try {
      await onCreate(payload);
      pendingPayloadRef.current = null;
      setForm(initialForm);
    } catch (err) {
      console.error("CreateAccountModal: create failed", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Account" // Đổi tiêu đề
      size="lg" // 'lg' có thể hơi to, 'md' sẽ vừa
      showFooter={false}
    >
      <div className="account-form">
        {" "}
        {/* Đổi class CSS */}
        {/* --- Form cho Account --- */}
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <label>Password</label>
        <input
          type="password"
          name="passwordHash"
          value={form.passwordHash}
          onChange={handleChange}
        />
        <label>Name</label>
        <input
          type="name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
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
        <select name="orgId" value={form.orgId} onChange={handleChange}>
          <option value="" disabled>
            -- Select an organization --
          </option>
          {organizations.map((org) => (
            <option key={org.orgId} value={org.orgId}>
              {org.name}
            </option>
          ))}
        </select>
        {/* --- Hết form --- */}
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
        title="Create Account" // Đổi tiêu đề
        message={`Are you sure you want to create account for "${
          form.email || "(no email)"
        }"?`} // Đổi nội dung
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmCreate}
      />
    </Modal>
  );
};

// Đổi propTypes
CreateAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.object).isRequired, // Thêm
};

export default CreateAccountModal; // Đổi export
