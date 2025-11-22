import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import "./AppointmentViewModal.css";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const formatDateOnly = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return iso;
  }
};

const AppointmentViewModal = ({
  isOpen,
  onClose,
  appointment,
  onCheckIn,
  onNoShow,
  onCancel,
  onDone,
  onRescheduleClick,
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!appointment) return null;

  const customerName = appointment.customerName ?? appointment.name ?? "-";
  const phone = appointment.customerPhoneNumber ?? appointment.phone ?? "-";
  const email = appointment.customerEmail ?? appointment.email ?? "-";

  const vin = appointment.vin ?? appointment.vehicleVin ?? "-";
  const model = appointment.model ?? "-";
  const year = appointment.year ?? "-";

  const type = appointment.appointmentType ?? appointment.type ?? "-";
  const date = appointment.appointmentDate ?? appointment.date ?? "-";
  const slot = appointment.slot ?? "-";
  const status = appointment.status ?? "-";

  const createdAt = formatDateOnly(appointment?.createdAt);

  const appointmentId = appointment.appointmentId ?? appointment.id ?? null;

  const handleCancel = async () => {
    if (!appointmentId) return;

    setIsCancelling(true);
    try {
      await request(ApiEnum.Appointment_CANCEL, {
        params: { appointmentId },
        _: 1,
      });

      toast.success("Appointment cancelled successfully!");

      if (typeof onCancel === "function");
      onClose();
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error(
        err?.responseData?.message || err?.message || "Failed to cancel"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const renderFooterActions = () => {
    const today = getTodayString();
    const isToday = date === today;
    const isPast = date < today;

    switch (status) {
      case "Scheduled":
      case "Pending":
        if (isToday) {
          return (
            <>
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>

              <Button
                variant="warning"
                onClick={async () => {
                  if (!appointmentId) return;
                  setIsMarkingNoShow(true);
                  try {
                    await request(ApiEnum.Appointment_NOSHOW, {
                      params: { appointmentId },
                      _: 1,
                    });
                    toast.success("Marked as No Show");
                    if (typeof onNoShow === "function");
                  } catch (err) {
                    toast.error(err?.responseData?.message || "Failed");
                  } finally {
                    setIsMarkingNoShow(false);
                  }
                }}
                disabled={isMarkingNoShow}
              >
                {isMarkingNoShow ? "Marking..." : "No Show"}
              </Button>

              <Button
                variant="primary"
                onClick={async () => {
                  if (!appointmentId) return;
                  setIsCheckingIn(true);
                  try {
                    await request(ApiEnum.Appointment_CHECKIN, {
                      params: { appointmentId },
                      _: 1,
                    });
                    toast.success("Checked in successfully");
                    if (typeof onCheckIn === "function");
                  } catch (err) {
                    toast.error(err?.responseData?.message || "Failed");
                  } finally {
                    setIsCheckingIn(false);
                  }
                }}
                disabled={isCheckingIn}
              >
                {isCheckingIn ? "Checking..." : "Check In"}
              </Button>
            </>
          );
        } else if (!isPast) {
          return (
            <>
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>

              <Button variant="light" onClick={onRescheduleClick}>
                Reschedule
              </Button>
            </>
          );
        } else {
          return (
            <Button variant="warning" onClick={() => onNoShow(appointmentId)}>
              Mark as No Show
            </Button>
          );
        }

      case "Checked-in":
        return (
          <Button variant="primary" onClick={() => onDone(appointmentId)}>
            Mark as Done
          </Button>
        );

      default:
        return (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
<<<<<<< Updated upstream
      title={
        appointmentId ? `Appointment ${appointmentId}` : "Appointment Details"
      }
      size="xl"
=======
      title={appointmentId ? `Appointment - ${status}` : "Appointment Details"}
      size="lg"
>>>>>>> Stashed changes
      showFooter={false}
    >
      <div className="appointment-modal">
        <h3 className="appointment-section-title">Customer Information</h3>
        <div className="appointment-info-row">
          <div className="appointment-info-block">
            <span className="info-block-label">Customer</span>
            <span className="info-block-value">{customerName}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Phone</span>
            <span className="info-block-value">{phone}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Email</span>
            <span className="info-block-value">{email}</span>
          </div>
        </div>

        <h3 className="appointment-section-title">Vehicle</h3>
        <div className="appointment-info-row">
          <div className="appointment-info-block">
            <span className="info-block-label">VIN</span>
            <span className="info-block-value">{vin}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Model</span>
            <span className="info-block-value">{model}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Year</span>
            <span className="info-block-value">{year}</span>
          </div>
        </div>

        <h3 className="appointment-section-title">Appointment</h3>
        <div className="appointment-info-row">
          <div className="appointment-info-block">
            <span className="info-block-label">Type</span>
            <span className="info-block-value">{type}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Appointment Date</span>
            <span className="info-block-value">{date}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Slot</span>
            <span className="info-block-value">{slot}</span>
          </div>

          <div className="appointment-info-block">
            <span className="info-block-label">Created At</span>
            <span className="info-block-value">{createdAt}</span>
          </div>
        </div>

        <div className="appointment-footer">
          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            {renderFooterActions()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

AppointmentViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.object,
  onCheckIn: PropTypes.func,
  onNoShow: PropTypes.func,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
  onRescheduleClick: PropTypes.func,
};

export default AppointmentViewModal;
