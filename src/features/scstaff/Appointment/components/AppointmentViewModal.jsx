import React from "react";
import PropTypes from "prop-types";
import Modal from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import "./AppointmentViewModal.css";

/*

  Mapping trường (ví dụ):
  - customerName <- appointment.customerName || appointment.name
  - vin <- appointment.vin || appointment.vehicleVin
  - appointmentId <- appointment.appointmentId || appointment.id

  Lưu ý UX:
  - Nếu `appointment` null => không render gì (component parent chịu trách nhiệm
    điều khiển `isOpen` và `appointment` truyền vào).
*/

const AppointmentViewModal = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null;

  // Chuẩn hoá một số trường để hiển thị
  const customerName = appointment.customerName ?? appointment.name ?? "-";
  const vin = appointment.vin ?? appointment.vehicleVin ?? "-";
  const type = appointment.appointmentType ?? appointment.type ?? "-";
  const date = appointment.appointmentDate ?? appointment.date ?? "-";
  const status = appointment.status ?? "-";
  const slot = appointment.slot ?? "-";
  const phone = appointment.customerPhoneNumber ?? appointment.phone ?? "-";
  const email = appointment.customerEmail ?? appointment.email ?? "-";
  const note = appointment.note ?? appointment.description ?? "-";
  const appointmentId = appointment.appointmentId ?? appointment.id ?? null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        appointmentId ? `Appointment ${appointmentId}` : "Appointment Details"
      }
      size="xl"
      showFooter={false}
    >
      <div className="appointment-modal">
        {/* Section 1: Appointment Info */}
        <h3 className="appointment-section-title">Appointment Information</h3>
        <div className="appointment-info-row">
          <div className="appointment-info-block">
            <span className="info-block-label">Customer</span>
            <span className="info-block-value">{customerName}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">VIN</span>
            <span className="info-block-value">{vin}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Type</span>
            <span className="info-block-value">{type}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Date</span>
            <span className="info-block-value">{date}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Slot</span>
            <span className="info-block-value">{slot}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Status</span>
            <span className="info-block-value">{status}</span>
          </div>
        </div>

        {/* Section 2: Contact */}
        <h3 className="appointment-section-title">Contact</h3>
        <div className="appointment-info-row">
          <div className="appointment-info-block">
            <span className="info-block-label">Phone</span>
            <span className="info-block-value">{phone}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Email</span>
            <span className="info-block-value">{email}</span>
          </div>
        </div>

        {/* Section 3: Notes */}
        {note && note !== "-" && (
          <>
            <h3 className="appointment-section-title">Notes</h3>
            <div className="appointment-info-row">
              <div className="appointment-info-block full-width">
                <span className="info-block-value">{note}</span>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="appointment-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

AppointmentViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.object,
};

export default AppointmentViewModal;
