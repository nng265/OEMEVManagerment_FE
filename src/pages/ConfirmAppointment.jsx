import React, { useEffect, useState } from "react";
import "./ConfirmAppointment.css";
import { request, ApiEnum } from "../services/NetworkUntil";

const ConfirmAppointment = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get("token");
    const appointmentId = urlParams.get("appointmentId");

    console.log("👉 URL token:", token);
    console.log("👉 URL appointmentId:", appointmentId);

    if (!token || !appointmentId) {
      setError("Invalid or missing token / appointment id!");
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        // 👉 Tạo endpoint động bằng cách replace :appointmentId
        const dynamicEndpoint = {
          ...ApiEnum.APPOINTMENT_CONFIRM,
          path: ApiEnum.APPOINTMENT_CONFIRM.path.replace(
            ":appointmentId",
            appointmentId
          ),
        };

        console.log("📤 Calling API:", dynamicEndpoint.path);

        const res = await request(
          dynamicEndpoint,
          { token }, // body chỉ có token
          { skipAuth: true } // không gửi Bearer token
        );

        console.log("📥 API Response:", res);

        if (!res || res.success === false) {
          setError(res?.message || "Failed to confirm appointment.");
          return;
        }

        setData(res.data);
      } catch (err) {
        console.log("❌ API Error:", err);
        setError(
          err?.responseData?.message ||
            err?.message ||
            "Failed to confirm appointment."
        );
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, []);

  if (loading)
    return (
      <div className="confirm-loading">Processing your confirmation...</div>
    );

  if (error) return <div className="confirm-error">{error}</div>;

  return (
    <div className="confirm-container">
      <div className="confirm-card">
        <div className="confirm-icon">✓</div>
        <h2>Booking confirmed!</h2>

        <div className="confirm-item">
          <b>VIN:</b> {data?.vin}
        </div>
        <div className="confirm-item">
          <b>Type:</b> {data?.appointmentType}
        </div>
        <div className="confirm-item">
          <b>Date:</b> {data?.appointmentDate}
        </div>
        <div className="confirm-item">
          <b>Slot:</b> {data?.slot}
        </div>
        <div className="confirm-item">
          <b>Email:</b> {data?.email}
        </div>

        <button
          className="confirm-done-btn"
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
