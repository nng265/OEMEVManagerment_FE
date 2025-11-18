// File: AppointmentRescheduleModal.js
// ----- BẢN ĐÃ FIX KHÔNG DOUBLE TOAST -----

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import { Button } from "../../../../components/atoms/Button/Button";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import "../components/AppointmentForm.css";
import "./AppointmentViewModal.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch (e) {
    console.error("formatDate error:", e);
    return "";
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    console.error("formatDateTime error:", e);
    return iso;
  }
};

const AppointmentRescheduleModal = ({
  isOpen,
  onClose,
  appointment,
  fetchTimeSlots,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceCenterId =
    appointment?.serviceCenterId ??
    appointment?.orgId ??
    appointment?.organizationId ??
    null;

  const customerName =
    appointment?.customerName ?? appointment?.name ?? "-";
  const phone =
    appointment?.customerPhoneNumber ?? appointment?.phone ?? "-";
  const email =
    appointment?.customerEmail ?? appointment?.email ?? "-";

  const vin = appointment?.vin ?? appointment?.vehicleVin ?? "-";
  const model = appointment?.model ?? "-";
  const year = appointment?.year ?? "-";

  const type = appointment?.appointmentType ?? appointment?.type ?? "-";
  const date = formatDate(appointment?.appointmentDate ?? appointment?.date);
  const slot = appointment?.slot ?? "-";
  const status = appointment?.status ?? "-";
  const createdAt = formatDate(appointment?.createdAt);

  const { minDateStr } = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return { minDateStr: formatDate(d) };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate("");
      setSelectedSlot(null);
      setTimeSlots([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const run = async () => {
      if (!serviceCenterId || !selectedDate) return;

      setIsLoading(true);
      setSelectedSlot(null);

      try {
        const slots = await fetchTimeSlots(serviceCenterId, selectedDate);
        setTimeSlots(slots || []);
      } catch (e) {
        console.error("Load slots error:", e);
        toast.error("Failed to load available timeslots.");
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [serviceCenterId, selectedDate, fetchTimeSlots]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select new date and slot.");
      return;
    }

    const appointmentId = String(
      appointment?.appointmentId ?? appointment?.id ?? ""
    );

    if (!appointmentId) {
      toast.error("Missing appointment ID.");
      return;
    }

    const slotCode =
      selectedSlot.slot ||
      selectedSlot.slotCode ||
      selectedSlot.id ||
      selectedSlot.time ||
      "";

    const payload = {
      params: { appointmentId },
      appointmentDate: selectedDate,
      slot: String(slotCode),
    };

    setIsSubmitting(true);

    try {
      await request(ApiEnum.Appointment_RESCHEDULE, payload);

      toast.success("Appointment rescheduled successfully!");
      onClose();
    } catch (err) {
      console.error("Reschedule error:", err);
      // ❗ Không toast nữa để tránh double-toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Reschedule Appointment"
      onClose={onClose}
      showFooter={false}
      size="lg"
    >
      <div className="appointment-modal-body">
        <h3 className="appointment-section-title">Current Appointment</h3>

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

        <div className="appointment-info-row" style={{ marginTop: 16 }}>
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
          <div className="appointment-info-block">
            <span className="info-block-label">Type</span>
            <span className="info-block-value">{type}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Current Date</span>
            <span className="info-block-value">{date}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Current Slot</span>
            <span className="info-block-value">{slot}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Status</span>
            <span className="info-block-value">{status}</span>
          </div>
          <div className="appointment-info-block">
            <span className="info-block-label">Created At</span>
            <span className="info-block-value">{createdAt}</span>
          </div>
        </div>

        <div className="step-box" style={{ marginTop: 20 }}>
          <h3 className="step-title">Select New Date</h3>
          <input
            type="date"
            className="form-input"
            min={minDateStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {selectedDate && (
            <>
              <h3 className="step-title" style={{ marginTop: 24 }}>
                Select New Time Slot
              </h3>

              <div className="time-grid">
                {isLoading ? (
                  <p>Loading available slots...</p>
                ) : timeSlots.length > 0 ? (
                  timeSlots.map((t) => {
                    const label =
                      t.time || t.slot || t.startTime || t.label || "";
                    const disabled =
                      t.isBooked || t.booked || t.disabled || t.isTaken;

                    return (
                      <button
                        key={label}
                        className={`time-slot-btn ${
                          selectedSlot === t ? "selected" : ""
                        }`}
                        disabled={disabled}
                        onClick={() => setSelectedSlot(t)}
                      >
                        {label}
                      </button>
                    );
                  })
                ) : (
                  <p>No available slots for this date.</p>
                )}
              </div>
            </>
          )}

          <div className="actions">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!selectedSlot || isSubmitting}
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

AppointmentRescheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointment: PropTypes.object,
  fetchTimeSlots: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AppointmentRescheduleModal;
