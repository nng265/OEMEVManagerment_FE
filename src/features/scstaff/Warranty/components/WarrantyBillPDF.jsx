// src/features/scstaff/Warranty/components/WarrantyBillPDF.jsx

import React from "react";
import PropTypes from "prop-types";
import "./WarrantyBillPDF.css";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export const WarrantyBillPDF = React.forwardRef(({ warrantyData }, ref) => {
  if (!warrantyData) return null;

  const isDenied = warrantyData.status?.toLowerCase() === "denied";
  const isRepaired = warrantyData.status?.toLowerCase() === "repaired";

  // Get SC Staff name from localStorage
  const getStaffName = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData?.name || userData?.fullName || userData?.username || "_______________";
    } catch {
      return "_______________";
    }
  };

  const staffName = getStaffName();
  const customerName = warrantyData.customerName || "_______________";
  const currentDate = formatDate(new Date());

  return (
    <div ref={ref} className="warranty-bill-pdf">
      {/* Header */}
      <div className="bill-header">
        <h1>WARRANTY CLAIM BILL</h1>
        <div className="bill-info">
          <p>
            <strong>Claim ID:</strong> {warrantyData.claimId || "-"}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(new Date())}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bill-section">
        <h2>Customer Information</h2>
        <div className="bill-grid">
          <div className="bill-item">
            <span className="bill-label">Name:</span>
            <span className="bill-value">{warrantyData.customerName || "-"}</span>
          </div>
          <div className="bill-item">
            <span className="bill-label">Phone:</span>
            <span className="bill-value">
              {warrantyData.customerPhoneNumber || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bill-section">
        <h2>Vehicle Information</h2>
        <div className="bill-grid">
          <div className="bill-item">
            <span className="bill-label">VIN:</span>
            <span className="bill-value">{warrantyData.vin || "-"}</span>
          </div>
          <div className="bill-item">
            <span className="bill-label">Model:</span>
            <span className="bill-value">{warrantyData.model || "-"}</span>
          </div>
          <div className="bill-item">
            <span className="bill-label">Year:</span>
            <span className="bill-value">{warrantyData.year || "-"}</span>
          </div>
        </div>
      </div>

      {/* For DENIED status */}
      {isDenied && (
        <>
          {/* Technician Description */}
          <div className="bill-section">
            <h2>Technician Assessment</h2>
            <div className="bill-item full-width">
              <span className="bill-label">Description:</span>
              <p className="bill-value">
                {warrantyData.technicianDescription ||
                  warrantyData.description ||
                  "No description provided"}
              </p>
            </div>
          </div>

          {/* Applied Warranty Policies */}
          {warrantyData.showPolicy && warrantyData.showPolicy.length > 0 && (
            <div className="bill-section">
              <h2>Applied Warranty Policies</h2>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Mileage Limit</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyData.showPolicy.map((policy, idx) => (
                    <tr key={idx}>
                      <td>{policy.policyType || "-"}</td>
                      <td>{policy.duration ? `${policy.duration} months` : "-"}</td>
                      <td>{policy.mileageLimit ? `${policy.mileageLimit} km` : "-"}</td>
                      <td>{policy.coverageDetails || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attachments/Images */}
          {warrantyData.attachments && warrantyData.attachments.length > 0 && (
            <div className="bill-section">
              <h2>Supporting Images</h2>
              <div className="bill-images">
                {warrantyData.attachments.map((attachment, idx) => (
                  <div key={idx} className="bill-image-container">
                    <img
                      src={attachment.url}
                      alt={`Attachment ${idx + 1}`}
                      className="bill-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* For REPAIRED status */}
      {isRepaired && (
        <>
          {/* Issue Description */}
          <div className="bill-section">
            <h2>Issue Description</h2>
            <div className="bill-item full-width">
              <span className="bill-label">Failure Description:</span>
              <p className="bill-value">{warrantyData.failureDesc || "-"}</p>
            </div>
            {warrantyData.description && (
              <div className="bill-item full-width">
                <span className="bill-label">Detailed Description:</span>
                <p className="bill-value">{warrantyData.description}</p>
              </div>
            )}
          </div>

          {/* Attachments/Images */}
          {warrantyData.attachments && warrantyData.attachments.length > 0 && (
            <div className="bill-section">
              <h2>Images</h2>
              <div className="bill-images">
                {warrantyData.attachments.map((attachment, idx) => (
                  <div key={idx} className="bill-image-container">
                    <img
                      src={attachment.url}
                      alt={`Attachment ${idx + 1}`}
                      className="bill-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Warranty Policy */}
          {warrantyData.policyName && (
            <div className="bill-section">
              <h2>Approved Warranty Coverage</h2>
              <div className="bill-item full-width">
                <span className="bill-label">Policy Name:</span>
                <p className="bill-value" style={{ fontWeight: '600', color: '#2c5282' }}>
                  {warrantyData.policyName}
                </p>
              </div>
            </div>
          )}

          {/* Repair Information - Parts/Components */}
          {warrantyData.showClaimParts && warrantyData.showClaimParts.length > 0 && (
            <div className="bill-section">
              <h2>Repair Information - Parts/Components</h2>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Model/Part Name</th>
                    <th>Old Serial Number</th>
                    <th>New Serial Number</th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyData.showClaimParts.map((part, idx) => (
                    <tr key={idx}>
                      <td>{part.action || "-"}</td>
                      <td>{part.model || "-"}</td>
                      <td>{part.serialNumberOld || "-"}</td>
                      <td>{part.serialNumberNew || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Signature Section */}
      <div className="bill-section signatures">
        <h2>Signatures</h2>
        <div className="signature-grid">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-label">Service Center Representative</p>
            <p className="signature-name">{staffName}</p>
            <p className="signature-date">Date: {currentDate}</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-label">Customer</p>
            <p className="signature-name">{customerName}</p>
            <p className="signature-date">Date: {currentDate}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bill-footer">
        <p>
          This document serves as an official record of the warranty claim process.
        </p>
        <p>
          For any questions or concerns, please contact our customer service.
        </p>
      </div>
    </div>
  );
});

WarrantyBillPDF.displayName = "WarrantyBillPDF";

WarrantyBillPDF.propTypes = {
  warrantyData: PropTypes.shape({
    warrantyClaimId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    customerName: PropTypes.string,
    customerPhoneNumber: PropTypes.string,
    vin: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    technicianDescription: PropTypes.string,
    failureDesc: PropTypes.string,
    policyName: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        attachmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    showPolicy: PropTypes.arrayOf(
      PropTypes.shape({
        policyType: PropTypes.string,
        duration: PropTypes.number,
        mileageLimit: PropTypes.number,
        coverageDetails: PropTypes.string,
      })
    ),
    showClaimParts: PropTypes.arrayOf(
      PropTypes.shape({
        action: PropTypes.string,
        model: PropTypes.string,
        serialNumberOld: PropTypes.string,
        serialNumberNew: PropTypes.string,
      })
    ),
  }),
};

export default WarrantyBillPDF;
