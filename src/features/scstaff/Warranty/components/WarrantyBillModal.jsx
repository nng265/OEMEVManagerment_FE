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
      const element = billRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true, // Allow cross-origin images
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Warranty_Bill_${
        warrantyData?.warrantyClaimId || "unknown"
      }_${new Date().getTime()}.pdf`;

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
      size="lg"
      showFooter={false}
    >
      <div className="warranty-bill-modal-content">
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
