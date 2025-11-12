// DEMO Component - For testing Warranty Bill feature
// src/features/scstaff/Warranty/components/WarrantyBillDemo.jsx

import React, { useState } from "react";
import { Button } from "../../../../components/atoms/Button/Button";
import { DeniedOrRepairedClaimModal } from "./DeniedOrRepairedClaimModal";
import { DENIED_WARRANTY_DATA, REPAIRED_WARRANTY_DATA } from "./TEST_DATA";
import "./WarrantyBillDemo.css";

/**
 * Demo component for testing Warranty Bill feature
 * 
 * HOW TO USE:
 * 1. Import this component in your route or parent component
 * 2. Render it: <WarrantyBillDemo />
 * 3. Click buttons to test different scenarios
 */
export const WarrantyBillDemo = () => {
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [showRepairedModal, setShowRepairedModal] = useState(false);

  const handleAction = (action) => {
    console.log("Action triggered:", action);
    alert(`Action triggered: ${action}`);
    
    // Close modals after action
    if (action === "doneWarranty") {
      setShowDeniedModal(false);
      setShowRepairedModal(false);
    }
  };

  return (
    <div className="warranty-bill-demo">
      <div className="demo-container">
        <h1>🧪 Warranty Bill Feature Demo</h1>
        <p className="demo-description">
          Click the buttons below to test the warranty bill feature with different statuses
        </p>

        <div className="demo-actions">
          <div className="demo-card">
            <h3>❌ Denied Status</h3>
            <p>
              Test bill for denied warranty claim. Shows technician description,
              warranty policies, and images.
            </p>
            <Button
              variant="danger"
              onClick={() => setShowDeniedModal(true)}
              size="lg"
            >
              Open Denied Claim Modal
            </Button>
          </div>

          <div className="demo-card">
            <h3>✅ Repaired Status</h3>
            <p>
              Test bill for repaired warranty claim. Shows issue description,
              parts replaced/repaired, and images.
            </p>
            <Button
              variant="success"
              onClick={() => setShowRepairedModal(true)}
              size="lg"
            >
              Open Repaired Claim Modal
            </Button>
          </div>
        </div>

        <div className="demo-info">
          <h3>📋 Features to Test:</h3>
          <ul>
            <li>✅ Click "View Bill" to preview the warranty bill</li>
            <li>✅ Click "Download PDF" to save as PDF file</li>
            <li>✅ Click "Print" to print the bill</li>
            <li>✅ Click "Customer Get Car" to complete the process</li>
            <li>✅ Check responsive design by resizing window</li>
            <li>✅ Test with different data (edit TEST_DATA.js)</li>
          </ul>
        </div>
      </div>

      {/* Denied Modal */}
      <DeniedOrRepairedClaimModal
        isOpen={showDeniedModal}
        onClose={() => setShowDeniedModal(false)}
        warrantyData={DENIED_WARRANTY_DATA}
        onAction={handleAction}
      />

      {/* Repaired Modal */}
      <DeniedOrRepairedClaimModal
        isOpen={showRepairedModal}
        onClose={() => setShowRepairedModal(false)}
        warrantyData={REPAIRED_WARRANTY_DATA}
        onAction={handleAction}
      />
    </div>
  );
};

export default WarrantyBillDemo;
