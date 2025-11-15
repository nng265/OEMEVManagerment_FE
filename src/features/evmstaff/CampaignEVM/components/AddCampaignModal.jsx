import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import "./AddCampaignModal.css";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

/*
  AddCampaignModal (VN):
  - Modal chứa form tạo campaign (presentational + nhẹ xử lý form state).
  - Trách nhiệm:
    * Quản lý state form local (title, type, category, models, dates, description)
    * Lấy danh mục part categories và models theo category khi modal mở
    * Validate form cơ bản, build payload và show ConfirmDialog trước khi gửi
    * Không gọi API trực tiếp để tạo campaign (container sẽ handle thông qua onSubmit)

  Ghi chú:
  - `onSubmit` được container truyền vào; modal chỉ build payload và gọi onSubmit
    khi user confirm.
*/

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

  // formData lưu toàn bộ trạng thái input của form.
  // Các trường có comment rõ ràng: `oldTarget` là model cũ, `target` là model mới.

  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Thêm state cho ConfirmDialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  // showConfirm/pendingPayload dùng để tạm giữ payload trước khi user confirm

  //  Reset form mỗi khi mở lại modal
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

  // Khi modal mở lại, reset form để tránh giữ dữ liệu cũ

  // Fetch categories
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
        console.error("Error fetching part categories:", err);
        toast.error("Failed to load part categories");
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  // Lấy danh mục part khi modal mở. Nếu API trả mảng trực tiếp hoặc object { success, data }
  // đều xử lý được.

  // Fetch models theo category
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
      console.error("Error fetching models by category:", err);
      toast.error("Failed to load part models");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Khi chọn category, gọi hàm này để lấy danh sách models tương ứng.

  //  Handle input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;

    //  Nếu chọn Type → reset model
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        oldTarget: "",
        target: "",
      }));
      return;
    }

    //  Nếu chọn Category → reset models + fetch mới
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

    //  Nếu chọn oldTarget → reset target nếu bị trùng
    if (name === "oldTarget") {
      setFormData((prev) => ({
        ...prev,
        oldTarget: value,
        target: prev.target === value ? "" : prev.target,
      }));
      return;
    }

    //  Nếu chọn target → reset oldTarget nếu bị trùng
    if (name === "target") {
      setFormData((prev) => ({
        ...prev,
        target: value,
        oldTarget: prev.oldTarget === value ? "" : prev.oldTarget,
      }));
      return;
    }

    //  Trường hợp còn lại
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handleChange xử lý nhiều trường đặc biệt:
  // - Khi thay đổi type/category sẽ reset các trường phụ để tránh dữ liệu mâu thuẫn
  // - Khi chọn oldTarget/target trùng nhau thì reset field kia để đảm bảo khác nhau

  //  Khi nhấn nút "Create" — hiển thị ConfirmDialog
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.type ||
      !formData.targetCategory ||
      !formData.oldTarget || //  thêm dòng này
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
      partModel: formData.oldTarget, // old
      replacementPartModel: formData.target, // new
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    // Hiện ConfirmDialog
    setPendingPayload(payload);
    setShowConfirm(true);
  };

  // Validation cơ bản trước khi build payload
  // Sau khi build payload chúng ta không gọi API trực tiếp ở đây, mà lưu payload
  // vào pendingPayload và hiện ConfirmDialog để user confirm.

  //  Xử lý ConfirmDialog
  const handleConfirm = () => {
    if (pendingPayload) {
      // Gọi onSubmit do container truyền vào — container sẽ gọi API và xử lý kết quả
      onSubmit(pendingPayload);
    }
    setShowConfirm(false);
    setPendingPayload(null);
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
              {formData.type === "" ? (
                <>
                  <option value="" disabled>
                    -- Select type --
                  </option>
                  <option value="Recall">Recall</option>
                  <option value="Service">Service</option>
                </>
              ) : (
                <>
                  <option value={formData.type} hidden>
                    {formData.type}
                  </option>
                  {["Recall", "Service"]
                    .filter((t) => t !== formData.type)
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group half">
            <label>Target Category *</label>
            <select
              name="targetCategory"
              value={formData.targetCategory}
              onChange={async (e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  targetCategory: value,
                  target: "",
                  oldTarget: "",
                }));
                await fetchModelsByCategory(value);
              }}
              className="form-select"
              required
              disabled={loadingCats}
            >
              {formData.targetCategory === "" && (
                <option value="" disabled>
                  -- Select category --
                </option>
              )}
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Target Part Model (Old) *</label>
            <select
              name="oldTarget"
              value={formData.oldTarget}
              onChange={handleChange}
              className="form-select"
              required
              disabled={!formData.targetCategory || loadingModels}
            >
              {formData.oldTarget === "" && (
                <option value="" disabled>
                  {formData.targetCategory
                    ? "-- Select old part model --"
                    : "Select category first"}
                </option>
              )}
              {models
                .filter((m) => m && m !== formData.target) // bỏ trùng với target
                .map((m, idx) => (
                  <option key={idx} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group half">
            <label>Target Part Model (New) *</label>
            <select
              name="target"
              value={formData.target}
              onChange={handleChange}
              className="form-select"
              required
              disabled={!formData.targetCategory || loadingModels}
            >
              {formData.target === "" && (
                <option value="" disabled>
                  {formData.targetCategory
                    ? "-- Select part model --"
                    : "Select category first"}
                </option>
              )}
              {models
                .filter((m) => m && m !== formData.oldTarget) // bỏ trùng với oldTarget
                .map((m, idx) => (
                  <option key={idx} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Start Date *</label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group half">
            <label>End Date *</label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            className="btn-cancel"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">Create Campaign & Notify Customers</Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Campaign Creation"
        message="Are you sure you want to create this campaign and notify customers?"
        confirmLabel="Yes, Create"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
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
