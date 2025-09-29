import React, { useEffect, useState } from "react";
import DropdownList from "../components/DropdownList"; // thêm import
import "./AssignTechnician.css";

export default function AssignTechnician() {
  const [claims, setClaims] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [claimsRes, techRes] = await Promise.all([
          fetch("http://localhost:3001/claims"),
          fetch("http://localhost:3001/technicians"),
        ]);
        const [claimsData, techData] = await Promise.all([
          claimsRes.json(),
          techRes.json(),
        ]);
        setClaims(claimsData);
        setTechnicians(techData);
      } catch (err) {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const assignTechnician = async (claimId, technicianId) => {
    try {
      const res = await fetch(`http://localhost:3001/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTechnicianId: technicianId,
          status: "assigned_pending",
          assignedDate: new Date().toISOString().split("T")[0],
        }),
      });
      const updated = await res.json();
      setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
    } catch {
      setError("Không thể phân công.");
    }
  };

  // Nhóm trạng thái
  const waitingAssign = claims.filter((c) => !c.assignedTechnicianId);
  const pending = claims.filter((c) => c.status === "assigned_pending");
  const inProgress = claims.filter((c) => c.status === "in_progress");
  const doneOrRejected = claims.filter(
    (c) => c.status === "completed" || c.status === "rejected"
  );

  const ClaimTable = ({ title, data, showAssign }) => (
    <div className="claim-section">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p className="empty-msg">Không có dữ liệu.</p>
      ) : (
        <div className="table-wrapper">
          <table className="claim-table">
            <thead>
              <tr>
                <th>VIN</th>
                <th>Yêu cầu</th>
                <th>Kỹ thuật viên</th>
                <th>Trạng thái</th>
                {showAssign && <th>Phân công</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>{c.vin}</td>
                  <td>
                    <p className="claim-title">{c.title}</p>
                    {c.notes && <p className="claim-notes">{c.notes}</p>}
                  </td>
                  <td>
                    {c.assignedTechnicianId
                      ? technicians.find((t) => t.id === c.assignedTechnicianId)
                          ?.name
                      : "Chưa gán"}
                  </td>
                  <td>
                    <span className={`status ${c.status || "waiting"}`}>
                      {c.status || "waiting"}
                    </span>
                  </td>
                  {showAssign && (
                    <td>
                      <DropdownList
                        value={c.assignedTechnicianId ?? ""}
                        onChange={(e) => assignTechnician(c.id, e.target.value)}
                        options={technicians.map((t) => ({
                          value: t.id,
                          label: t.name,
                        }))}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="assign-container">
      <h2>Quản lý phân công kỹ thuật viên</h2>

      <ClaimTable title="Chờ phân công" data={waitingAssign} showAssign />
      <ClaimTable title="Chờ kỹ thuật viên xác nhận" data={pending} />
      <ClaimTable title="Đang sửa chữa" data={inProgress} />
      <ClaimTable title="Hoàn tất / Từ chối" data={doneOrRejected} />
    </div>
  );
}
