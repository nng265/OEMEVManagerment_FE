import React, { useState, useEffect } from "react";
import "./SendToStaff.css";

export default function SendToStaff() {
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const claimsRes = await fetch("http://localhost:3001/claims");
        const claimsData = await claimsRes.json();
        setClaims(claimsData);

        const vehiclesRes = await fetch("http://localhost:3001/vehicles");
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClaims = claims.filter(
    (c) => c.status === "waiting_staff" || c.status === "sent_to_manufacturer"
  );

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="send-container">
      <h2>Danh sách công việc đã gửi cho Staff</h2>

      {filteredClaims.length === 0 ? (
        <p>Không có công việc nào.</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Mẫu xe</th>
              <th>Loại công việc</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((c) => (
              <tr key={c.id}>
                <td>{c.vin}</td>
                <td>{vehicles.find((v) => v.vin === c.vin)?.model || "-"}</td>
                <td>{c.jobType || "-"}</td>
                <td>{c.description || "(Không có mô tả)"}</td>
                <td className="status-cell">
                  {c.status === "waiting_staff" && (
                    <span className="status badge waiting">
                      Chờ Staff xử lý
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
