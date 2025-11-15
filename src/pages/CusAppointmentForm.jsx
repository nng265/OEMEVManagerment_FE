import React, { useState, useEffect, useMemo } from "react";
import "./CusAppointmentForm.css";
import { toast } from "react-toastify";
import ConfirmDialog from "../components/molecules/ConfirmDialog/ConfirmDialog";
import { Button } from "../components/atoms/Button/Button";
import { request, ApiEnum } from "../services/NetworkUntil";

const formatDate = (date) => date.toISOString().split("T")[0];
const STEPS = [
  "Service Center",
  "Maintenance Date",
  "Time Slot",
  "Vehicle Information",
];

const CusAppointmentForm = () => {
  // ========== STATE ==========
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("WARRANTY");
  const [info, setInfo] = useState({ vin: "", model: "", year: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // success popup
  const [successData, setSuccessData] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // ========== DATE RANGE ==========
  const { minDateStr } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() + 3);
    return { minDateStr: formatDate(min) };
  }, []);

  // ========== FETCH SERVICE CENTERS ==========
  useEffect(() => {
    let mounted = true;
    const loadCenters = async () => {
      try {
        const res = await request(ApiEnum.ORGANIZATION, {});
        const data = Array.isArray(res) ? res : res?.data || [];
        if (!mounted) return;
        setCenters(
          data.map((o) => ({
            id:
              o.id ?? o.orgId ?? o.organizationId ?? o._id ?? o.org_id ?? null,
            name: o.name ?? o.orgName ?? o.title ?? "",
            region: o.region ?? o.location ?? "",
            contact: o.contact ?? o.contactInfo ?? o.phone ?? o.email ?? "",
          }))
        );
      } catch (err) {
        console.error("Failed to load centers:", err);
        toast.error("Failed to load service centers");
      }
    };
    loadCenters();
    return () => {
      mounted = false;
    };
  }, []);

  // ========== FETCH AVAILABLE TIME SLOTS ==========
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCenter?.id || !selectedDate) return;
      setIsLoading(true);
      try {
        setSelectedSlot(null);
        setSelectedTime("");
        const res = await request(ApiEnum.APPOINTMENT_TIMESLOTS, {
          orgId: selectedCenter.id,
          date: selectedDate,
        });
        const data = Array.isArray(res) ? res : res?.data || [];
        setTimeSlots(data);
      } catch (err) {
        console.error("Failed to load timeslots:", err);
        toast.error("Failed to load available timeslots");
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSlots();
  }, [selectedCenter, selectedDate]);

  // ========== STEP NAVIGATION ==========
  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  // ========== VALIDATION ==========
  const currentYear = new Date().getFullYear();
  const isYearValid =
    /^\d{4}$/.test(info.year) &&
    Number(info.year) >= 2000 &&
    Number(info.year) <= currentYear + 1;
  const isInfoValid =
    info.vin.trim() !== "" && info.model.trim() !== "" && isYearValid;

  const handleInfoChange = (field) => (e) =>
    setInfo((prev) => ({ ...prev, [field]: e.target.value }));

  // ========== CONFIRM & CREATE ==========
  const handleConfirmAppointment = () => setIsDialogOpen(true);

  const confirmAppointment = async () => {
    if (!selectedCenter || !selectedDate || !selectedSlot) {
      toast.error("Please select center, date, and time.");
      return;
    }

    const yearNum = Number(info.year);
    if (!isYearValid) {
      toast.error(`Year must be between 2000 and ${currentYear + 1}.`);
      return;
    }

    const slotCode =
      selectedSlot?.slot ||
      selectedSlot?.slotCode ||
      selectedSlot?.id ||
      selectedTime;

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
      const res = await request(ApiEnum.APPOINTMENT_CREATE_CUS, payload);

      setSuccessData(res.data); // lưu data
      setIsSuccessOpen(true); // mở popup

      toast.success("Appointment booked successfully!");
      setIsDialogOpen(false);
      // Reset form
      setStep(1);
      setSelectedCenter(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setSelectedTime("");
      setInfo({ vin: "", model: "", year: "" });
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

  // ========== RENDER UI ==========
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
    <div className="appointment">
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
              <p>Loading slots...</p>
            ) : timeSlots.length > 0 ? (
              timeSlots.map((t) => {
                const display =
                  t.time || t.slot || t.startTime || t.label || "";
                const booked =
                  t.isBooked || t.booked || t.disabled || t.isTaken;
                return (
                  <button
                    key={display}
                    className={`time-slot-btn ${
                      selectedTime === display ? "selected" : ""
                    }`}
                    disabled={booked}
                    onClick={() => {
                      setSelectedTime(display);
                      setSelectedSlot(t);
                    }}
                  >
                    {display}
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
            <Button disabled={!selectedSlot} onClick={handleNext}>
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

      <SuccessPopup
        isOpen={isSuccessOpen}
        data={successData}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
};

const SuccessPopup = ({ isOpen, data, onClose }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-icon">✓</div>
        <h2>Booking Success!</h2>
        <div className="success-item">
          <b>VIN:</b> {data.vin}
        </div>
        <div className="success-item">
          <b>TYPE:</b> {data?.appointmentType || "N/A"}
        </div>
        <div className="success-item">
          <b>Date Create: </b>{" "}
          {data?.createdAt
            ? new Date(data.createdAt).toLocaleDateString("en-GB") // dd/mm/yyyy
            : "N/A"}
        </div>
        <div className="success-item">
          <b>Appointment Date: </b>{" "}
          {data?.appointmentDate
            ? new Date(data.appointmentDate).toLocaleDateString("en-GB") // dd/mm/yyyy
            : "N/A"}
        </div>
        <div className="success-item">
          <b>Slot:</b> {data.slot}
        </div>
        <div className="success-item">
          <b>Email:</b> {data.email}
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CusAppointmentForm;
