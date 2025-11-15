import React, { useState, useEffect, useMemo } from "react";
import "./AppointmentForm.css";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { Button } from "../../../../components/atoms/Button/Button";

const formatDate = (date) => date.toISOString().split("T")[0];

const STEPS = [
  "Service Center",
  "Maintenance Date",
  "Time Slot",
  "Vehicle Information",
];

function AppointmentForm({
  onSuccess,
  centers = [],
  fetchTimeSlots,
  createAppointment,
}) {
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState("WARRANTY");
  const [info, setInfo] = useState({ vin: "", model: "", year: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [successData, setSuccessData] = useState(null);
  // const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  // const [lastResponse, setLastResponse] = useState(null);

  const { minDateStr } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() + 3);
    return { minDateStr: formatDate(min) };
  }, []);

  // Fetch available slots when center or date changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCenter?.id || !selectedDate || !fetchTimeSlots) return;
      setIsLoading(true);
      try {
        setSelectedTime("");
        setSelectedSlot(null);
        const slots = await fetchTimeSlots(selectedCenter.id, selectedDate);
        setTimeSlots(slots || []);
      } catch (err) {
        console.error("Failed to load timeslots:", err);
        toast.error("Failed to load available timeslots");
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSlots();
  }, [selectedCenter, selectedDate, fetchTimeSlots]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const currentYear = new Date().getFullYear();
  const isYearValid =
    /^\d{4}$/.test(info.year) &&
    Number(info.year) >= 2000 &&
    Number(info.year) <= currentYear + 1;
  const isInfoValid =
    info.vin.trim() !== "" && info.model.trim() !== "" && isYearValid;

  const handleInfoChange = (field) => (e) =>
    setInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const handleConfirmAppointment = () => setIsDialogOpen(true);

  const confirmAppointment = async () => {
    if (!selectedCenter) {
      toast.error("Please select a service center.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a maintenance date.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a valid time slot.");
      return;
    }
    if (!info.vin || !info.model || !info.year) {
      toast.error("Please fill in all vehicle information.");
      return;
    }

    const yearNum = Number(info.year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
      toast.error(`Year must be between 2000 and ${currentYear + 1}.`);
      return;
    }

    const slotCode =
      selectedSlot?.slot ||
      selectedSlot?.slotCode ||
      selectedSlot?.id ||
      selectedTime;

    if (!slotCode) {
      toast.error("Selected slot is invalid.");
      return;
    }

    const payload = {
      appointmentDate: selectedDate,
      appointmentType: appointmentType.toUpperCase(),
      model: info.model.trim(),
      serviceCenterId: String(selectedCenter.id),
      slot: slotCode,
      vin: info.vin.trim().toUpperCase(),
      year: yearNum,
    };

    try {
      setIsLoading(true);
      const res = await createAppointment(payload);
      setIsDialogOpen(false);
      if (typeof onSuccess === "function") onSuccess(res);
    } catch (err) {
      console.error("Create appointment error:", err);
      const msg =
        err?.responseData?.message ||
        err?.message ||
        "Failed to create appointment";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSteps = () => (
    <div className="steps">
      {STEPS.map((label, i) => (
        <span key={label} className={step === i + 1 ? "active" : ""}>
          {i + 1}. {label}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <h2 className="appointment-title">Vehicle Service Appointment</h2>
      {renderSteps()}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="step-box">
          <h3 className="step-title">Select Service Center</h3>
          <div className="center-list">
            {centers.map((c) => (
              <div
                key={c.id}
                className={`center-card ${
                  selectedCenter?.id === c.id ? "selected" : ""
                }`}
                onClick={() => setSelectedCenter(c)}
              >
                <h4>{c.name}</h4>
                <p>{c.region}</p>
                <p>{c.contact}</p>
              </div>
            ))}
          </div>
          <div className="actions">
            <Button disabled={!selectedCenter} onClick={handleNext}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="step-box">
          <div className="summary-box">
            <p>
              <b>Center:</b> {selectedCenter?.name}
            </p>
            <Button variant="light" size="sm" onClick={() => setStep(1)}>
              Change Center
            </Button>
          </div>
          <h3 className="step-title">Select Maintenance Date</h3>
          <input
            type="date"
            className="form-input"
            min={minDateStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="actions">
            <Button variant="secondary" onClick={handleBack}>
              Go Back
            </Button>
            <Button disabled={!selectedDate} onClick={handleNext}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="step-box">
          <div className="summary-box">
            <p>
              <b>Center:</b> {selectedCenter?.name}
            </p>
            <p>
              <b>Date:</b> {selectedDate}
            </p>
            <Button variant="light" size="sm" onClick={() => setStep(2)}>
              Change Date
            </Button>
          </div>
          <h3 className="step-title">Select Time Slot</h3>
          <div className="time-grid">
            {isLoading ? (
              <p>Loading available slots...</p>
            ) : timeSlots.length > 0 ? (
              timeSlots.map((t) => {
                const displayTime =
                  t.time || t.slot || t.startTime || t.label || "";
                const booked =
                  t.isBooked || t.booked || t.disabled || t.isTaken;
                return (
                  <button
                    key={displayTime}
                    className={`time-slot-btn ${
                      selectedTime === displayTime ? "selected" : ""
                    }`}
                    disabled={booked}
                    onClick={() => {
                      setSelectedTime(displayTime);
                      setSelectedSlot(t);
                    }}
                  >
                    {displayTime}
                  </button>
                );
              })
            ) : (
              <p>No available slots</p>
            )}
          </div>
          <div className="actions">
            <Button variant="secondary" onClick={handleBack}>
              Go Back
            </Button>
            <Button disabled={!selectedTime} onClick={handleNext}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="step-box">
          <div className="summary-box">
            <p>
              <b>Center:</b> {selectedCenter?.name}
            </p>
            <p>
              <b>Date:</b> {selectedDate}
            </p>
            <p>
              <b>Time:</b> {selectedTime}
            </p>
            <Button variant="light" size="sm" onClick={() => setStep(3)}>
              Change Date/Time
            </Button>
          </div>

          <h3 className="step-title">Enter Vehicle Information</h3>
          <div className="info-form">
            <label>Appointment Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="apptType"
                  value="WARRANTY"
                  checked={appointmentType === "WARRANTY"}
                  onChange={(e) => setAppointmentType(e.target.value)}
                />
                Warranty
              </label>
              <label>
                <input
                  type="radio"
                  name="apptType"
                  value="CAMPAIGN"
                  checked={appointmentType === "CAMPAIGN"}
                  onChange={(e) => setAppointmentType(e.target.value)}
                />
                Campaign
              </label>
            </div>

            <label>VIN</label>
            <input
              type="text"
              className="form-input"
              value={info.vin}
              onChange={handleInfoChange("vin")}
            />

            <label>Model</label>
            <input
              type="text"
              className="form-input"
              value={info.model}
              onChange={handleInfoChange("model")}
            />

            <label>Year of Manufacture</label>
            <input
              type="text"
              className="form-input"
              placeholder="YYYY"
              value={info.year}
              onChange={handleInfoChange("year")}
            />
            {!isYearValid && info.year && (
              <small className="error-message">
                Invalid year. Please enter between 2000 - {currentYear + 1}.
              </small>
            )}
          </div>

          <div className="actions">
            <Button variant="secondary" onClick={handleBack}>
              Go Back
            </Button>
            <Button onClick={handleConfirmAppointment} disabled={!isInfoValid}>
              Confirm Appointment
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Confirm Appointment"
        message={`Confirm appointment at ${selectedCenter?.name} on ${selectedDate} at ${selectedTime}?`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={confirmAppointment}
        onCancel={() => setIsDialogOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}

export default AppointmentForm;
