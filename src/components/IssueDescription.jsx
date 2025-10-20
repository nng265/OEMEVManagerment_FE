// src/components/IssueDescription.jsx
import React from "react";
import "./CommonSections.css";

const IssueDescription = ({ description }) => (
  <div className="section-container">
    <h4 className="section-title">Issue Description</h4>
    <p className="section-text">{description || "No description provided."}</p>
  </div>
);

export default IssueDescription;
