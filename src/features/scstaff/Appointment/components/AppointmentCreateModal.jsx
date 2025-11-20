import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import AppointmentForm from "./AppointmentForm";
import "./AppointmentForm.css";

export const AppointmentCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  centers,
  timeSlots,
  fetchTimeSlots,
  createAppointment,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Create New Appointment"
      onClose={onClose}
      showFooter={false}
      size="xl"
    >
      <div className="appointment-modal-body">
        <AppointmentForm
          onSuccess={onSuccess}
          onClose={onClose}
          centers={centers}
          timeSlots={timeSlots}
          fetchTimeSlots={fetchTimeSlots}
          createAppointment={createAppointment}
        />
      </div>
    </Modal>
  );
};

AppointmentCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AppointmentCreateModal;
