import { useEffect, useState, useCallback } from "react";
import Button from "../components/Button";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./StaffApproval.css";

export default function StaffApproval() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/claims")
      .then((res) => res.json())
      .then((data) => setClaims(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Lỗi load claims:", err));
  }, []);

  const updateClaimStatus = async (claimId, status) => {
    const updated = {
      status,
      approvedDate: status === "approved" ? new Date().toISOString() : null,
    };

    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
    );

    if (selectedClaim?.id === claimId) {
      setSelectedClaim(null);
    }

    try {
      await fetch(`http://localhost:3001/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("❌ Lỗi update claim:", err);
    }
  };

  const handleEscClose = useCallback((e) => {
    if (e.key === "Escape") {
      setSelectedClaim(null);
      setPreviewImage(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [handleEscClose]);

  const renderAttachments = (attachments) =>
    attachments?.map((file, i) => {
      const url = file.url || file;
      const isImage =
        /\.(jpeg|jpg|png|gif)$/i.test(url) || file.type === "image";
      return isImage ? (
        <img
          key={i}
          src={url}
          alt={`attachment-${i}`}
          className="staff-approval-attachment-img"
          onClick={() => setPreviewImage(url)}
        />
      ) : (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="staff-approval-attachment-file"
        >
          File đính kèm {i + 1}
        </a>
      );
    });

  return (
    <div className="staff-approval-container">
      <h2 className="staff-approval-title">Phê duyệt hồ sơ</h2>

      {claims.length === 0 ? (
        <p className="staff-approval-empty">Không có hồ sơ cần duyệt</p>
      ) : (
        <table className="staff-approval-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Lựa chọn</th>
            </tr>
          </thead>
          <tbody>
            {claims
              .filter((c) => c.status === "waiting_staff")
              .map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.vin}</td>
                  <td>{claim.description || "(Không có mô tả)"}</td>
                  <td>
                    {claim.createdDate
                      ? new Date(claim.createdDate).toLocaleDateString("vi-VN") //to-do
                      : claim.assignedDate
                      ? new Date(claim.assignedDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>

                  <td>
                    <div className="staff-approval-actions">
                      <Button
                        className="staff-approval-btn-view"
                        onClick={() => setSelectedClaim(claim)}
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
          onClick={() => setSelectedClaim(null)}
        >
          <div
            className="staff-approval-modal"
            onClick={(e) => e.stopPropagation()} // tránh tắt khi click vào trong modal
          >
            <h3 className="staff-approval-modal-title">
              Chi tiết hồ sơ bảo hành / sửa chữa
              <span
                className="staff-approval-modal-close"
                onClick={() => setSelectedClaim(null)}
              >
                ×
              </span>
            </h3>

            <p>
              <strong>VIN:</strong> {selectedClaim.vin}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedClaim.description}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedClaim.date
                ? new Date(selectedClaim.date).toLocaleDateString("vi-VN")
                : "-"}
            </p>
            <p>
              <strong>Sổ bảo hành:</strong>{" "}
              {selectedClaim.warrantyBook || "Không có"}
            </p>

            {selectedClaim.attachments?.length > 0 && (
              <div className="staff-approval-attachments">
                <h4>Tài liệu đính kèm:</h4>
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
                      <th>Tên linh kiện</th>
                      <th>Số lượng</th>
                      <th>Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClaim.parts.map((part, index) => (
                      <tr key={index}>
                        <td>{part.category}</td>
                        <td>{part.quantity}</td>
                        <td>{part.type}</td>
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
