import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/atoms/Button/Button';
import { Modal } from '../../../components/molecules/Modal/Modal';
import { DetailSection } from '../../../components/molecules/DetailSection/DetailSection';
import { DetailModalActions } from '../../../components/molecules/DetailModalActions/DetailModalActions';
import { WarrantyRecordsSection } from '../../../components/molecules/WarrantyRecordsSection/WarrantyRecordsSection';
import { request, ApiEnum } from '../../../services/NetworkUntil';
import './CreateWarrantyClaimModal.css';

export const CreateWarrantyClaimModal = ({ show, onHide, vehicle, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [assignTech, setAssignTech] = useState(false);
  const [technicians, setTechnicians] = useState([{ id: 1 }]); // Initial tech slot
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (assignTech) {
        try {
          setLoading(true);
          setError(null);
          const response = await request(ApiEnum.GET_TECHNICIANS);
          if (response.success) {
            // Filter to get only employees with SC_TECH role
            const techList = response.data.filter(emp => emp.role === 'SC_TECH');
            setAvailableTechs(techList);
          } else {
            setError('Unable to load technician list');
          }
        } catch (err) {
          console.error('Error fetching technicians:', err);
          setError('An error occurred while loading technician list');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTechnicians();
  }, [assignTech]);

  const handleAddTechnician = () => {
    // Đảm bảo ID là duy nhất
    const newId = (technicians[technicians.length - 1]?.id || 0) + 1;
    setTechnicians([...technicians, { id: newId }]);
  };

  const handleRemoveTechnician = (id) => {
    if (technicians.length > 1) {
      setTechnicians(technicians.filter(tech => tech.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      // vehicle: vehicle, // CarListContainer đã có selectedVehicle, chỉ cần gửi ID
      vehicleId: vehicle.id, // Sửa lại: Gửi vehicleId
      description: description,
      assignTech: assignTech,
      technicianIds: assignTech ? technicians.map(tech => tech.selectedValue).filter(Boolean) : [] // Sửa lại: Gửi technicianIds
    };
    onSubmit(formData); // Gửi dữ liệu đã được chuẩn hóa
  };

  if (!vehicle) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onHide}
      title="Create Warranty Claim"
      size="lg"
      showFooter={false}
    >
      <form onSubmit={handleSubmit}>
        {/* Vehicle Information */}
        <DetailSection title="Vehicle Information">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">VIN:</span>
              <span className="value">{vehicle.vin}</span>
            </div>
            <div className="detail-item">
              <span className="label">Model:</span>
              <span className="value">{vehicle.model}</span>
            </div>
            <div className="detail-item">
              <span className="label">Year:</span>
              <span className="value">{vehicle.year}</span>
            </div>
          </div>
        </DetailSection>

        {/* Customer Information */}
        <DetailSection title="Customer Information">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">{vehicle.customerName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Phone:</span>
              <span className="value">{vehicle.customerPhoneNunmber || vehicle.customerPhoneNumber}</span>
            </div>
          </div>
        </DetailSection>

        {/* Warranty Records */}
        <WarrantyRecordsSection warrantyRecords={vehicle.policyInformation} />

        {/* Issue Description */}
        <DetailSection title="Issue Description">
          <div className="issue-description">
            <textarea
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          {/* Assign Technicians */}
          <div className="assign-technicians">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={assignTech}
                onChange={(e) => setAssignTech(e.target.checked)}
              />
              Assign Technicians
            </label>
          </div>

          {assignTech && (
            <div className="technicians-section">
              <h5>Assigned Technicians List</h5>
              {technicians.map((tech) => (
                <div key={tech.id} className="technician-row">
                  {loading ? (
                    <div className="select-loading">Loading...</div>
                  ) : error ? (
                    <div className="select-error">{error}</div>
                  ) : (
                    <select
                      className="form-select tech-select"
                      value={tech.selectedValue || ''}
                      onChange={(e) => {
                        const updatedTechs = technicians.map(t =>
                          t.id === tech.id ? { ...t, selectedValue: e.target.value } : t
                        );
                        setTechnicians(updatedTechs);
                      }}
                    >
                      <option value="">Select Technician</option>
                      {availableTechs.map(techOpt => (
                        <option key={techOpt.employeeId} value={techOpt.employeeId}>
                          {techOpt.fullName} - {techOpt.employeeCode}
                        </option>
                      ))}
                    </select>
                  )}
                  {technicians.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => handleRemoveTechnician(tech.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={handleAddTechnician}
                className="mt-2"
              >
                Add Technician
              </Button>
            </div>
          )}
        </DetailSection>

        <DetailModalActions onBack={onHide} backLabel="Cancel">
          <Button variant="primary" type="submit">
            Create Warranty Claim
          </Button>
        </DetailModalActions>
      </form>
    </Modal>
  );
};