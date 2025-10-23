// src/features/technician/components/WorkOrderDetailModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../components/atoms/Button/Button';
import { Modal } from '../../../components/molecules/Modal/Modal';
import { formatDate } from '../../../utils/helpers';
import './WorkOrderDetailModal.css';

export const WorkOrderDetailModal = ({ isOpen, onClose, workOrderData }) => {
  if (!workOrderData) return null;

  // Lấy thông tin warranty claim nếu có
  const warrantyInfo = workOrderData.warrantyClaim;
  const [inspectionDesc, setInspectionDesc] = React.useState('');
  const [attachments, setAttachments] = React.useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitInspection = () => {
    // TODO: Implement API call to submit inspection
    console.log('Submit inspection:', {
      workOrderId: workOrderData.workOrderId,
      description: inspectionDesc,
      attachments
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Work Order Details #${workOrderData.workOrderId}`}
      size="lg"
      showFooter={false}
    >
      <div className="work-order-modal">
        {/* Work order information */}
        <div className="detail-block">
          <h4>Work Order Information</h4>
          <div className="info-container">
            <div className="info-row">
              <div className="label">Work Type</div>
              <div className="content">{workOrderData.type}</div>
            </div>
            <div className="info-row">
              <div className="label">Target</div>
              <div className="content">{workOrderData.target}</div>
            </div>
            <div className="info-row">
              <div className="label">Status</div>
              <div className="content">
                <span className={`badge status-${workOrderData.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {workOrderData.status}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="label">Start Date</div>
              <div className="content">{formatDate(workOrderData.startDate)}</div>
            </div>
            {workOrderData.endDate && (
              <div className="info-row">
                <div className="label">End Date</div>
                <div className="content">{formatDate(workOrderData.endDate)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle information and issue description */}
        {warrantyInfo && (
          <div className="detail-block">
            <h4>Vehicle Information</h4>
            <div className="info-container">
              <div className="info-row">
                <div className="label">VIN</div>
                <div className="content">{warrantyInfo.vin}</div>
              </div>
              <div className="info-row">
                <div className="label">Model</div>
                <div className="content">{warrantyInfo.model}</div>
              </div>
              <div className="info-row">
                <div className="label">Year</div>
                <div className="content">{warrantyInfo.year}</div>
              </div>
            </div>
            {warrantyInfo.failureDesc && (
              <div className="description-block">
                <h4>Issue Description</h4>
                <div className="text-block">
                  <div className="content">{warrantyInfo.failureDesc}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inspection details (only shown for Inspection work orders) */}
        {workOrderData.type === 'Inspection' && (
          <div className="detail-block">
            <h4>Inspection Details</h4>
            
            {/* Display description from API if available */}
            {workOrderData.description && (
              <div className="inspection-existing">
                <h5>Current Inspection Results</h5>
                <div className="text-block">
                  <div className="content">{workOrderData.description}</div>
                </div>
              </div>
            )}

            {/* Display attachments from API if available */}
            {warrantyInfo?.attachments && warrantyInfo.attachments.length > 0 && (
              <div className="attachment-section">
                <h5>Existing Images</h5>
                <div className="attachments-grid">
                  {warrantyInfo.attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <img src={file.url} alt={`Attachment ${index + 1}`} />
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button size="small" variant="secondary">View</Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form for entering new inspection information */}
            {workOrderData.status === 'in progress' && (
              <div className="inspection-form">
                <h5>Add Inspection Results</h5>
                <div className="form-group">
                  <label>Detailed Description:</label>
                  <textarea
                    value={inspectionDesc}
                    onChange={(e) => setInspectionDesc(e.target.value)}
                    placeholder="Enter detailed inspection results..."
                    rows={4}
                    className="inspection-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Attached Images:</label>
                  <div className="upload-section">
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>
                  {attachments.length > 0 && (
                    <div className="attachments-preview">
                      {attachments.map((file, index) => (
                        <div key={index} className="preview-item">
                          <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleRemoveFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={handleSubmitInspection}
            disabled={!inspectionDesc.trim() && attachments.length === 0}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

WorkOrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workOrderData: PropTypes.shape({
    workOrderId: PropTypes.string.isRequired,
    assignedTo: PropTypes.string,
    type: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    notes: PropTypes.string,
    warrantyClaim: PropTypes.shape({
      claimId: PropTypes.string.isRequired,
      vin: PropTypes.string,
      failureDesc: PropTypes.string,
      status: PropTypes.string,
      model: PropTypes.string,
      year: PropTypes.number,
      attachments: PropTypes.array
    })
  })
};

WorkOrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workOrderData: PropTypes.shape({
    workOrderId: PropTypes.string.isRequired,
    assignedTo: PropTypes.string,
    type: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    notes: PropTypes.string,
    warrantyClaim: PropTypes.shape({
      claimId: PropTypes.string.isRequired,
      vin: PropTypes.string,
      failureDesc: PropTypes.string,
      status: PropTypes.string,
      model: PropTypes.string,
      year: PropTypes.number,
      attachments: PropTypes.array
    })
  })
};