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

const SuccessPopup = ({ isOpen, data, onClose }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-icon">✓</div>
        <h2>Booking Success!</h2>

        <div className="success-item">
          <b>Đã đặt lịch thông qua Email:</b> {data.email}
        </div>

        <div className="popup-btn-group">
          <button
            className="view-btn"
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            View Email
          </button>

          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CusAppointmentForm = () => {
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
  const [successData, setSuccessData] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const { minDateStr } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate() + 3);
    return { minDateStr: formatDate(min) };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCenters = async () => {
      try {
        const res = await request(ApiEnum.ORGANIZATION, {});
        const data = Array.isArray(res) ? res : res?.data || [];

        if (!mounted) return;

        setCenters(
          data.map((o) => ({
            id: o.id ?? o.orgId ?? o.organizationId ?? null,
            name: o.name ?? o.orgName ?? "",
            region: o.region ?? "",
            contact: o.contact ?? "",
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load service centers");
      }
    };

    loadCenters();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCenter?.id || !selectedDate) return;

      setIsLoading(true);
      setSelectedSlot(null);
      setSelectedTime("");

      try {
        const res = await request(ApiEnum.APPOINTMENT_TIMESLOTS, {
          orgId: selectedCenter.id,
          date: selectedDate,
        });

        setTimeSlots(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        toast.error("Failed to load timeslots");
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlots();
  }, [selectedCenter, selectedDate]);

  const currentYear = new Date().getFullYear();
  const isYearValid =
    /^\d{4}$/.test(info.year) &&
    Number(info.year) >= 2000 &&
    Number(info.year) <= currentYear + 1;

  const isInfoValid =
    info.vin.trim() !== "" && info.model.trim() !== "" && isYearValid;

  const handleInfoChange = (field) => (e) =>
    setInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const confirmAppointment = async () => {
    if (!selectedCenter || !selectedDate || !selectedSlot) {
      toast.error("Please complete all steps.");
      return;
    }

    const slotCode = selectedSlot.slot || selectedSlot.id || selectedTime;

    const payload = {
      appointmentDate: selectedDate,
      appointmentType: appointmentType.toUpperCase(),
      model: info.model.trim(),
      serviceCenterId: String(selectedCenter.id),
      slot: slotCode,
      vin: info.vin.trim().toUpperCase(),
      year: Number(info.year),
    };

    try {
      const res = await request(ApiEnum.APPOINTMENT_CREATE_CUS, payload);

      setSuccessData(res.data);
      setIsSuccessOpen(true);
      setIsDialogOpen(false);
      toast.success("Appointment created!");

      setStep(1);
      setSelectedCenter(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setSelectedTime("");
      setInfo({ vin: "", model: "", year: "" });
    } catch (err) {
      const msg = err?.responseData?.message || err?.message || "Error";
      toast.error(msg);
    }
  };

  /* ---------- Step bullets ---------- */
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
      <nav className="main-nav">
        <a href="/home" className="logo">
          EVM Service
        </a>
        <div className="nav-links">
          <a href="/home">Home</a>
          <a href="/cusappointmentform" className="btn">
            Đặt lịch hẹn
          </a>
        </div>
      </nav>

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

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/home")}
              >
                Back
              </Button>

              <Button disabled={!selectedCenter} onClick={() => setStep(2)}>
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
                Change
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
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!selectedDate} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

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
                Change
              </Button>
            </div>

            <h3 className="step-title">Select Time Slot</h3>

            <div className="time-grid">
              {isLoading ? (
                <p>Loading...</p>
              ) : timeSlots.length ? (
                timeSlots.map((t) => {
                  const display = t.time || t.slot || "";
                  return (
                    <button
                      key={display}
                      className={`time-slot-btn ${
                        selectedTime === display ? "selected" : ""
                      }`}
                      disabled={t.isBooked}
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
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button disabled={!selectedSlot} onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </div>
        )}

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
                Change
              </Button>
            </div>

            <h3 className="step-title">Vehicle Information</h3>

            <div className="info-form">
              <label>Appointment Type</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="WARRANTY"
                    checked={appointmentType === "WARRANTY"}
                    onChange={() => setAppointmentType("WARRANTY")}
                  />
                  Warranty
                </label>
                <label>
                  <input
                    type="radio"
                    value="CAMPAIGN"
                    checked={appointmentType === "CAMPAIGN"}
                    onChange={() => setAppointmentType("CAMPAIGN")}
                  />
                  Campaign
                </label>
              </div>

              <label>VIN</label>
              <input
                className="form-input"
                value={info.vin}
                onChange={handleInfoChange("vin")}
              />

              <label>Model</label>
              <input
                className="form-input"
                value={info.model}
                onChange={handleInfoChange("model")}
              />

              <label>Year</label>
              <input
                className="form-input"
                placeholder="YYYY"
                value={info.year}
                onChange={handleInfoChange("year")}
              />
              {!isYearValid && info.year && (
                <small className="error-message">
                  Invalid year. Must be 2000 - {currentYear + 1}
                </small>
              )}
            </div>

            <div className="actions">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                disabled={!isInfoValid}
                onClick={() => setIsDialogOpen(true)}
              >
                Confirm Appointment
              </Button>
            </div>
          </div>
        )}

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
    </>
  );
};

export default CusAppointmentForm;
