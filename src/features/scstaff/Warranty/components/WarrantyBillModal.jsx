// src/features/scstaff/Warranty/components/WarrantyBillModal.jsx

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { WarrantyBillPDF } from "./WarrantyBillPDF";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./WarrantyBillModal.css";

export const WarrantyBillModal = ({ isOpen, onClose, warrantyData }) => {
  const billRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!billRef.current) return;

    setIsGenerating(true);
    try {
      // Get the element to convert to PDF
      const element = billRef.current;
      
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `Warranty_Bill_${warrantyData?.warrantyClaimId || "unknown"}_${new Date().getTime()}.pdf`;
      
      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Warranty Bill Preview"
      size="xl"
      showFooter={false}
    >
      <div className="warranty-bill-modal-content">
        {/* Action buttons */}
        <div className="bill-actions">
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating PDF..." : "Download PDF"}
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Bill preview */}
        <div className="bill-preview-container">
          <WarrantyBillPDF ref={billRef} warrantyData={warrantyData} />
        </div>
      </div>
    </Modal>
  );
};

WarrantyBillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  warrantyData: PropTypes.object,
};

export default WarrantyBillModal;
