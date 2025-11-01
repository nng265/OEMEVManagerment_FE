import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { Input } from "../../../../components/atoms/Input/Input";
import "./AddCampaignModal.css";
import { request, ApiEnum } from "../../../../services/NetworkUntil";

export const AddCampaignModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "", // để hiển thị placeholder, không chọn sẵn
    target: "", // sẽ là Part Model được chọn
    oldTarget: "", // old part model (left column)
    targetCategory: "", // Category được chọn
    startDate: "",
    endDate: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.type || // đảm bảo user đã chọn type
      !formData.targetCategory ||
      !formData.target || // phải chọn part model
      !formData.startDate ||
      !formData.endDate ||
      !formData.description
    ) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const newCampaign = {
      ...formData,
      stats: { affected: 0, scheduled: 0, inProgress: 0, completed: 0 },
    };

    onSubmit(newCampaign);
  };

  // Fetch categories khi mở modal
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      try {
        const res = await request(ApiEnum.GET_PART_CATEGORY);
        const cats = Array.isArray(res)
          ? res
          : res?.success && Array.isArray(res.data)
          ? res.data
          : [];
        setCategories(cats);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching part categories:", err);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch models theo category
  const fetchModelsByCategory = async (category) => {
    if (!category) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const res = await request(ApiEnum.GET_PART_MODEL, { category });
      const list = Array.isArray(res)
        ? res
        : res?.success && Array.isArray(res.data)
        ? res.data
        : [];
      setModels(list);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching models by category:", err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    // Truyền `isOpen` xuống Modal để Modal có thể kiểm tra và render nội dung.
    <Modal
      isOpen={isOpen}
      title="Create Service Campaign"
      onClose={onClose}
      showFooter={false}
      size="lg"
    >
      <form className="add-campaign-form" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}

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
              {formData.type === "" && (
                <option value="" disabled>
                  -- Select type --
                </option>
              )}
              <option value="Recall">Recall</option>
              <option value="Warranty">Warranty</option>
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

        {/* Second row: place Target Part Model aligned under Target Category (right column) */}
        <div className="form-row">
          <div className="form-group half">
            <label>Target Part Model (Old)</label>
            {/* Temporary manual input until old-model API is available */}
            <Input
              name="oldTarget"
              value={formData.oldTarget}
              onChange={handleChange}
              placeholder="Enter old part model (temporary)"
            />
          </div>
          <div className="form-group half">
            <label>Target Part Model *</label>
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
              {models.map((m, idx) => (
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Campaign & Notify Customers</Button>
        </div>
      </form>
    </Modal>
  );
};

AddCampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddCampaignModal;
