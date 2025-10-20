import React from "react";
import "./CommonSections.css";

const InspectionDetail = ({ detail, images = [] }) => {
  return (
    <div className="section-container">
      <h4 className="section-title">Inspection Detail</h4>
      <p className="section-text">{detail || "No inspection details."}</p>

      <div className="image-gallery">
        {images.length > 0 ? (
          images.map((img, i) => (
            <div key={i} className="image-placeholder">
              <img src={img} alt={`Inspection ${i + 1}`} />
            </div>
          ))
        ) : (
          <p className="section-text">No images provided.</p>
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;
