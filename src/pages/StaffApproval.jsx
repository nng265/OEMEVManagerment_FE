import { useEffect, useState, useCallback } from "react";
import Button from "../components/Button";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./StaffApproval.css";

export default function StaffApproval() {
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu từ server
  const fetchClaims = async () => {
    try {
      const res = await fetch("http://localhost:3001/claims");
      const data = await res.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi load claims:", err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Update trạng thái claim
  const updateClaimStatus = async (claimId, status) => {
    setLoading(true);
    const updated = {
      status,
      approvedDate: status === "approved" ? new Date().toISOString() : null,
    };

    // Cập nhật state trước để UI nhanh nhạy
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
    );

    // Nếu modal đang mở claim này, đóng modal
    if (selectedClaimId === claimId) setSelectedClaimId(null);

    try {
      await fetch(`http://localhost:3001/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      // Reload data để đảm bảo đồng bộ
      fetchClaims();
    } catch (err) {
      console.error("❌ Lỗi update claim:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEscClose = useCallback((e) => {
    if (e.key === "Escape") {
      setSelectedClaimId(null);
      setPreviewImage(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [handleEscClose]);

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return <p className="staff-approval-empty">Không có ảnh nào</p>;
    }

    return attachments.map((file, i) => {
      const url = typeof file === "string" ? file : file.url || "";
      return (
        <div key={i} className="staff-approval-image-thumb">
          <img
            src={url}
            alt={`attachment-${i}`}
            onClick={() => setPreviewImage(url)}
          />
        </div>
      );
    });
  };

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || null;

  return (
    <div className="staff-approval-container">
      <h2 className="staff-approval-title">Phê duyệt hồ sơ</h2>

      {claims.filter((c) => c.status === "waiting_staff").length === 0 ? (
        <p className="staff-approval-empty">Không có hồ sơ cần duyệt</p>
      ) : (
        <table className="staff-approval-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Mô tả kỹ thuật</th>
              <th>Lựa chọn</th>
            </tr>
          </thead>
          <tbody>
            {claims
              .filter((c) => c.status === "waiting_staff")
              .map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.vin}</td>
                  <td>{claim.techDescription || "(Chưa có mô tả kỹ thuật)"}</td>
                  <td>
                    <div className="staff-approval-actions">
                      <Button
                        className="staff-approval-btn-view"
                        onClick={() => setSelectedClaimId(claim.id)}
                      >
                        Xem
                      </Button>
                      <Button
                        className="staff-approval-btn-accept"
                        onClick={() => updateClaimStatus(claim.id, "approved")}
                        disabled={loading}
                      >
                        <FaCheck />
                      </Button>
                      <Button
                        className="staff-approval-btn-reject"
                        onClick={() => updateClaimStatus(claim.id, "rejected")}
                        disabled={loading}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {selectedClaim && (
        <div
          className="staff-approval-overlay"
          onClick={() => {
            setSelectedClaimId(null);
            setPreviewImage(null);
          }}
        >
          <div
            className="staff-approval-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="staff-approval-modal-title">
              Chi tiết hồ sơ
              <span
                className="staff-approval-modal-close"
                onClick={() => {
                  setSelectedClaimId(null);
                  setPreviewImage(null);
                }}
              >
                ×
              </span>
            </h3>

            {/* ===== Thông tin xe ===== */}
            <div className="staff-approval-section">
              <h4>Thông tin xe</h4>
              <div className="staff-approval-row">
                <span>VIN:</span>
                <span>{selectedClaim.vin}</span>
              </div>
              <div className="staff-approval-row">
                <span>Mô tả kỹ thuật:</span>
                <span>{selectedClaim.techDescription || "(Chưa có)"}</span>
              </div>
              <div className="staff-approval-row">
                <span>Sổ bảo hành:</span>
                <span>{selectedClaim.warrantyBook || "Không có"}</span>
              </div>
            </div>

            {/* ===== Tài liệu đính kèm ===== */}
            {selectedClaim.attachments?.length > 0 && (
              <div className="staff-approval-section">
                <h4>Tài liệu đính kèm</h4>
                <div className="staff-approval-attachments-list">
                  {renderAttachments(selectedClaim.attachments)}
                </div>
              </div>
            )}

            {selectedClaim.parts?.length > 0 && (
              <div className="staff-approval-parts">
                <h4>Linh kiện sửa chữa / thay thế:</h4>
                <table className="staff-approval-parts-table">
                  <thead>
                    <tr>
                      <th>Tên công việc</th>
                      <th>Tên linh kiện</th>
                      <th>Mẫu</th>
                      <th>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClaim.parts.map((part, i) => (
                      <tr key={i}>
                        <td>{part.type || "-"}</td>
                        <td>{part.category || "-"}</td>
                        <td>{part.model || "-"}</td>
                        <td>{part.quantity || 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="staff-approval-modal-actions">
              <Button
                className="staff-approval-btn-accept"
                onClick={() => updateClaimStatus(selectedClaim.id, "approved")}
                disabled={loading}
              >
                <FaCheck /> Chấp nhận gửi yêu cầu lên hãng
              </Button>
              <Button
                className="staff-approval-btn-reject"
                onClick={() => updateClaimStatus(selectedClaim.id, "rejected")}
                disabled={loading}
              >
                <FaTimes /> Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="staff-approval-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="staff-approval-preview-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="staff-approval-preview-close"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </span>
            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
