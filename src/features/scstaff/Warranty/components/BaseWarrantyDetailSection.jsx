// src/features/warranty/components/BaseWarrantyDetailSection.jsx

import React from "react";
import PropTypes from "prop-types";
import { DetailSection } from "../../../../components/molecules/DetailSection/DetailSection";
import { WarrantyRecordsSection } from "../../../../components/molecules/WarrantyRecordsSection/WarrantyRecordsSection";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const BaseWarrantyDetailSection = ({ warrantyData }) => {
  if (!warrantyData) return null;

  return (
    <>
      {/* Customer Information */}
      <DetailSection title="Customer Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{warrantyData?.customerName || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">
              {warrantyData?.customerPhoneNumber || "-"}
            </span>
          </div>
        </div>
      </DetailSection>

      {/* Vehicle Information */}
      <DetailSection title="Vehicle Information">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">VIN:</span>
            <span className="value">{warrantyData?.vin || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Model:</span>
            <span className="value">{warrantyData?.model || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">Year:</span>
            <span className="value">{warrantyData?.year || "-"}</span>
          </div>
        </div>
      </DetailSection>

      {/* Warranty Records / Policy Information */}
      <WarrantyRecordsSection
        warrantyRecords={warrantyData?.showPolicy}
        status={warrantyData?.status}
      />

      {/* Issue Description */}
      <DetailSection title="Issue Description">
        <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
          {warrantyData?.failureDesc && (
            <div className="detail-item">
              <span className="label">Short Description:</span>
              <span className="value">{warrantyData.failureDesc}</span>
            </div>
          )}
          {warrantyData?.description && (
            <div className="detail-item">
              <span className="label">Details:</span>
              <span className="value" style={{ whiteSpace: "pre-wrap" }}>
                {warrantyData.description}
              </span>
            </div>
          )}
        </div>
      </DetailSection>

      {/* Attachments */}
      {warrantyData?.attachments?.length > 0 && (
        <DetailSection title="Attachments">
          <div
            className="attachments-grid"
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
          >
            {warrantyData.attachments.map((a) => (
              <a
                key={a.attachmentId || a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={a.url}
                  alt="Attachment"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </a>
            ))}
          </div>
        </DetailSection>
      )}

      {/* Approved Warranty Record */}
      {warrantyData?.policyName && (
        <DetailSection title="Approved Warranty Record">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Policy Name:</span>
              <span
                className="value"
                style={{ fontWeight: "600", color: "#2c5282" }}
              >
                {warrantyData.policyName}
              </span>
            </div>
          </div>
        </DetailSection>
      )}

      {/* Parts / Components */}
      {warrantyData?.showClaimParts?.length > 0 && (
        <DetailSection title="Parts / Components Details">
          {warrantyData.showClaimParts.map((p, idx) => (
            <div key={idx} className="policy-item">
              <h5>{p.model || p.action || `Part ${idx + 1}`}</h5>
              <div
                className="detail-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                <div className="detail-item">
                  <span className="label">Action:</span>
                  <span className="value">{p.action || "-"}</span>
                </div>
                {/* <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{p.category || "-"}</span>
                </div> */}
                <div className="detail-item">
                  <span className="label">Model:</span>
                  <span className="value">{p.model || "-"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Old Serial:</span>
                  <span className="value">{p.serialNumberOld || "-"}</span>
                </div>
                {p.serialNumberNew && (
                  <div className="detail-item">
                    <span className="label">New Serial:</span>
                    <span className="value">{p.serialNumberNew}</span>
                  </div>
                )}
                {/* {p.status && (
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">{p.status}</span>
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </DetailSection>
      )}
    </>
  );
};

BaseWarrantyDetailSection.propTypes = {
  warrantyData: PropTypes.object.isRequired,
};

export default BaseWarrantyDetailSection;
