import { useEffect, useState } from "react";
import "./TechView.css";
import Button from "../components/Button";

export default function TechView() {
  const [claims, setClaims] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu claims + technicians
    Promise.all([
      fetch("http://localhost:3001/claims").then((res) => res.json()),
      fetch("http://localhost:3001/technicians").then((res) => res.json()),
    ]).then(([claimsData, techsData]) => {
      setClaims(claimsData);
      setTechnicians(techsData);
    });
  }, []);

  const handleApprove = async (claimId) => {
    const updated = {
      status: "in_progress",
      approvedDate: new Date().toISOString(),
    };

    await fetch(`http://localhost:3001/claims/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
    );
  };

  const handleReject = async (claimId) => {
    const updated = {
      status: "rejected",
      approvedDate: null,
    };

    await fetch(`http://localhost:3001/claims/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
    );
  };

  const getTechName = (id) => {
    const t = technicians.find((x) => x.id === id);
    return t ? t.name : "Chưa rõ";
  };

  return (
    <div className="techview-container">
      <h2>🔧 TechView - Yêu cầu kỹ thuật viên xử lý</h2>
      <table className="techview-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>VIN</th>
            <th>Tiêu đề</th>
            <th>Kỹ thuật viên</th>
            <th>Trạng thái</th>
            <th>Ngày phân công</th>
            <th>Duyệt</th>
          </tr>
        </thead>
        <tbody>
          {claims
            .filter((c) =>
              technicians.some((t) => t.id === c.assignedTechnicianId)
            )
            .map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{claim.vin}</td>
                <td className="claim-title">{claim.title}</td>
                <td>{getTechName(claim.assignedTechnicianId)}</td>
                <td>
                  <span className={`status ${claim.status}`}>
                    {claim.status}
                  </span>
                </td>
                <td>{claim.assignedDate || "-"}</td>
                <td>
                  {claim.status === "assigned_pending" ? (
                    <div className="action-btns">
                      <Button
                        className="btn-accept"
                        onClick={() => handleApprove(claim.id)}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        className="btn-reject"
                        onClick={() => handleReject(claim.id)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  ) : claim.status === "rejected" ? (
                    "Đã từ chối"
                  ) : claim.status === "in_progress" ? (
                    "Đã duyệt - Đang sửa chữa"
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
