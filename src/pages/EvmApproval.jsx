// // import { useEffect, useState } from "react";
// // import Button from "../components/Button";
// // import "./EvmApproval.css";

// // export default function EvmApproval() {
// //   const [claims, setClaims] = useState([]);
// //   const [selectedClaim, setSelectedClaim] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   // Load danh sách claims
// //   useEffect(() => {
// //     fetch("http://localhost:3001/claims")
// //       .then((res) => res.json())
// //       .then((data) => setClaims(Array.isArray(data) ? data : []))
// //       .catch((err) => console.error("❌ Lỗi load claims:", err));
// //   }, []);

// //   // Cập nhật trạng thái
// //   const updateClaimStatus = async (claimId, status) => {
// //     const updated = {
// //       status,
// //       approvedDate: status === "approved" ? new Date().toISOString() : null,
// //     };

// //     // ✅ Cập nhật UI ngay lập tức
// //     setClaims((prev) =>
// //       prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
// //     );

// //     if (selectedClaim?.id === claimId) {
// //       setSelectedClaim({ ...selectedClaim, ...updated });
// //       setTimeout(() => setSelectedClaim(null), 400); // đóng modal nhanh hơn
// //     }

// //     try {
// //       // Gọi API ngầm
// //       await fetch(`http://localhost:3001/claims/${claimId}`, {
// //         method: "PATCH",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(updated),
// //       });
// //     } catch (err) {
// //       console.error("❌ Lỗi update claim:", err);
// //       // rollback nếu lỗi
// //       setClaims((prev) =>
// //         prev.map((c) =>
// //           c.id === claimId ? { ...c, status: "waiting_approved" } : c
// //         )
// //       );
// //     }
// //   };

// //   return (
// //     <div className="evm-approval-container">
// //       <h2>Phê duyệt hồ sơ bảo hành </h2>

// //       {claims.length === 0 ? (
// //         <p>Không có hồ sơ cần duyệt</p>
// //       ) : (
// //         <table className="evm-approval-table">
// //           <thead>
// //             <tr>
// //               <th>VIN</th>
// //               <th>Mô tả</th>
// //               <th>Ngày tạo</th>
// //               <th>Trạng thái</th>
// //               <th>Hành động</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {claims
// //               .filter((c) => c.status === "waiting_approved")
// //               .map((claim) => (
// //                 <tr key={claim.id}>
// //                   <td>{claim.vin}</td>
// //                   <td>{claim.description || "(Không có mô tả)"}</td>
// //                   <td>
// //                     {claim.date
// //                       ? new Date(claim.date).toLocaleDateString("vi-VN") // ví dụ: 02/10/2025
// //                       : "-"}
// //                   </td>
// //                   <td>
// //                     <span className={`status ${claim.status}`}>
// //                       {claim.status}
// //                     </span>
// //                   </td>
// //                   <td>
// //                     <Button
// //                       className="btn-view"
// //                       onClick={() => setSelectedClaim(claim)}
// //                     >
// //                       Xem
// //                     </Button>
// //                     <Button
// //                       className="btn-accept"
// //                       onClick={() => updateClaimStatus(claim.id, "approved")}
// //                       disabled={loading}
// //                     >
// //                       ✅
// //                     </Button>
// //                     <Button
// //                       className="btn-reject"
// //                       onClick={() => updateClaimStatus(claim.id, "rejected")}
// //                       disabled={loading}
// //                     >
// //                       ❌
// //                     </Button>
// //                   </td>
// //                 </tr>
// //               ))}
// //           </tbody>
// //         </table>
// //       )}

// //       {/* Modal chi tiết */}
// //       {selectedClaim && (
// //         <div className="modal-container">
// //           <h3>
// //             Chi tiết hồ sơ bảo hành
// //             <span
// //               className="modal-close-icon"
// //               onClick={() => setSelectedClaim(null)}
// //             >
// //               ×
// //             </span>
// //           </h3>

// //           <p>
// //             <strong>VIN:</strong> {selectedClaim.vin}
// //           </p>
// //           <p>
// //             <strong>Mô tả:</strong> {selectedClaim.description}
// //           </p>
// //           <p>
// //             <strong>Ngày tạo:</strong>{" "}
// //             {selectedClaim.date
// //               ? new Date(selectedClaim.date).toLocaleDateString("vi-VN")
// //               : "-"}
// //           </p>

// //           <p>
// //             <strong>Sổ bảo hành:</strong>{" "}
// //             {selectedClaim.warrantyBook || "Không có"}
// //           </p>

// //           {/* Hiển thị attachments */}
// //           {selectedClaim.attachments?.length > 0 && (
// //             <div className="attachments">
// //               <h4>Tài liệu đính kèm:</h4>
// //               <div className="attachments-list">
// //                 {selectedClaim.attachments.map((file, i) => {
// //                   const url = file.url || file; // hỗ trợ cả object lẫn string
// //                   const isImage = url.match(/\.(jpeg|jpg|png|gif|png)$/i);
// //                   return isImage || file.type === "image" ? (
// //                     <img
// //                       key={i}
// //                       src={url}
// //                       alt={`attachment-${i}`}
// //                       className="attachment-img"
// //                     />
// //                   ) : (
// //                     <a
// //                       key={i}
// //                       href={url}
// //                       target="_blank"
// //                       rel="noreferrer"
// //                       className="attachment-file"
// //                     >
// //                       File đính kèm {i + 1}
// //                     </a>
// //                   );
// //                 })}
// //               </div>
// //             </div>
// //           )}

// //           <div className="modal-actions">
// //             <Button
// //               className="btn-accept"
// //               onClick={() => updateClaimStatus(selectedClaim.id, "approved")}
// //               disabled={loading}
// //             >
// //               Chấp nhận
// //             </Button>
// //             <Button
// //               className="btn-reject"
// //               onClick={() => updateClaimStatus(selectedClaim.id, "rejected")}
// //               disabled={loading}
// //             >
// //               Từ chối
// //             </Button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useEffect, useState, useCallback } from "react";
// import Button from "../components/Button";
// import "./EvmApproval.css";
// import { FaCheck, FaTimes } from "react-icons/fa";

// export default function EvmApproval() {
//   const [claims, setClaims] = useState([]);
//   const [selectedClaim, setSelectedClaim] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null); // popup xem ảnh to

//   // Load danh sách claims
//   useEffect(() => {
//     fetch("http://localhost:3001/claims")
//       .then((res) => res.json())
//       .then((data) => setClaims(Array.isArray(data) ? data : []))
//       .catch((err) => console.error("❌ Lỗi load claims:", err));
//   }, []);

//   // Cập nhật trạng thái claim
//   const updateClaimStatus = async (claimId, status) => {
//     const updated = {
//       status,
//       approvedDate: status === "approved" ? new Date().toISOString() : null,
//     };

//     // ✅ Update UI ngay
//     setClaims((prev) =>
//       prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
//     );

//     if (selectedClaim?.id === claimId) {
//       setSelectedClaim({ ...selectedClaim, ...updated });
//       setTimeout(() => setSelectedClaim(null), 400); // đóng modal nhanh
//     }

//     try {
//       await fetch(`http://localhost:3001/claims/${claimId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updated),
//       });
//     } catch (err) {
//       console.error("Lỗi update claim:", err);
//       // rollback nếu lỗi
//       setClaims((prev) =>
//         prev.map((c) =>
//           c.id === claimId ? { ...c, status: "waiting_approved" } : c
//         )
//       );
//     }
//   };

//   // Đóng popup bằng ESC
//   const handleEscClose = useCallback((e) => {
//     if (e.key === "Escape") {
//       setPreviewImage(null);
//       setSelectedClaim(null);
//     }
//   }, []);

//   useEffect(() => {
//     window.addEventListener("keydown", handleEscClose);
//     return () => window.removeEventListener("keydown", handleEscClose);
//   }, [handleEscClose]);

//   return (
//     <div className="evm-approval-container">
//       <h2>Phê duyệt hồ sơ bảo hành </h2>

//       {claims.length === 0 ? (
//         <p>Không có hồ sơ cần duyệt</p>
//       ) : (
//         <table className="evm-approval-table">
//           <thead>
//             <tr>
//               <th>VIN</th>
//               <th>Mô tả</th>
//               <th>Ngày tạo</th>
//               <th>Trạng thái</th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {claims
//               .filter((c) => c.status === "waiting_approved")
//               .map((claim) => (
//                 <tr key={claim.id}>
//                   <td>{claim.vin}</td>
//                   <td>{claim.description || "(Không có mô tả)"}</td>
//                   <td>
//                     {claim.date
//                       ? new Date(claim.date).toLocaleDateString("vi-VN")
//                       : "-"}
//                   </td>
//                   <td>
//                     <span className={`status ${claim.status}`}>
//                       {claim.status}
//                     </span>
//                   </td>
//                   <td>
//                     <Button
//                       className="btn-view"
//                       onClick={() => setSelectedClaim(claim)}
//                     >
//                       Xem
//                     </Button>
//                     <Button
//                       className="btn-accept"
//                       onClick={() =>
//                         updateClaimStatus(selectedClaim.id, "approved")
//                       }
//                       disabled={loading}
//                     >
//                       <FaCheck className="icon" />
//                     </Button>
//                     <Button
//                       className="btn-reject"
//                       onClick={() =>
//                         updateClaimStatus(selectedClaim.id, "rejected")
//                       }
//                       disabled={loading}
//                     >
//                       <FaTimes className="icon" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       )}

//       {/* Modal chi tiết claim */}
//       {selectedClaim && (
//         <div className="modal-container">
//           <h3>
//             Chi tiết hồ sơ bảo hành
//             <span
//               className="modal-close-icon"
//               onClick={() => setSelectedClaim(null)}
//             >
//               ×
//             </span>
//           </h3>

//           <p>
//             <strong>VIN:</strong> {selectedClaim.vin}
//           </p>
//           <p>
//             <strong>Mô tả:</strong> {selectedClaim.description}
//           </p>
//           <p>
//             <strong>Ngày tạo:</strong>{" "}
//             {selectedClaim.date
//               ? new Date(selectedClaim.date).toLocaleDateString("vi-VN")
//               : "-"}
//           </p>

//           <p>
//             <strong>Sổ bảo hành:</strong>{" "}
//             {selectedClaim.warrantyBook || "Không có"}
//           </p>

//           {/* Hiển thị attachments */}
//           {selectedClaim.attachments?.length > 0 && (
//             <div className="attachments">
//               <h4>Tài liệu đính kèm:</h4>
//               <div className="attachments-list">
//                 {selectedClaim.attachments.map((file, i) => {
//                   const url = file.url || file;
//                   const isImage =
//                     url.match(/\.(jpeg|jpg|png|gif)$/i) ||
//                     file.type === "image";
//                   return isImage ? (
//                     <img
//                       key={i}
//                       src={url}
//                       alt={`attachment-${i}`}
//                       className="attachment-img"
//                       onClick={() => setPreviewImage(url)} // 👈 click mở popup ảnh to
//                     />
//                   ) : (
//                     <a
//                       key={i}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="attachment-file"
//                     >
//                       File đính kèm {i + 1}
//                     </a>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           <div className="modal-actions">
//             <Button
//               className="btn-accept"
//               onClick={() => updateClaimStatus(selectedClaim.id, "approved")}
//               disabled={loading}
//             >
//               <FaCheck className="icon" /> Chấp nhận
//             </Button>
//             <Button
//               className="btn-reject"
//               onClick={() => updateClaimStatus(selectedClaim.id, "rejected")}
//               disabled={loading}
//             >
//               <FaTimes className="icon" /> Từ chối
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Popup xem ảnh to */}
//       {previewImage && (
//         <div
//           className="image-preview-overlay"
//           onClick={() => setPreviewImage(null)}
//         >
//           <div
//             className="image-preview-content"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <span
//               className="image-preview-close"
//               onClick={() => setPreviewImage(null)}
//             >
//               ×
//             </span>
//             <img src={previewImage} alt="Preview" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from "react";
import Button from "../components/Button";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./EvmApproval.css";

export default function EvmApproval() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load danh sách claims
  useEffect(() => {
    fetch("http://localhost:3001/claims")
      .then((res) => res.json())
      .then((data) => setClaims(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Lỗi load claims:", err));
  }, []);

  // Cập nhật trạng thái claim
  const updateClaimStatus = async (claimId, status) => {
    const updated = {
      status,
      approvedDate: status === "approved" ? new Date().toISOString() : null,
    };

    // Update UI ngay lập tức
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updated } : c))
    );

    // Nếu modal đang mở và đang hiển thị claim này, tắt luôn modal
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
      // rollback nếu lỗi
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: "waiting_approved" } : c
        )
      );
    }
  };

  // Đóng modal / popup bằng ESC
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
          className="attachment-img"
          onClick={() => setPreviewImage(url)}
        />
      ) : (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="attachment-file"
        >
          File đính kèm {i + 1}
        </a>
      );
    });

  return (
    <div className="evm-approval-container">
      <h2>Phê duyệt hồ sơ bảo hành</h2>

      {claims.length === 0 ? (
        <p>Không có hồ sơ cần duyệt</p>
      ) : (
        <table className="evm-approval-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {claims
              .filter((c) => c.status === "waiting_approved")
              .map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.vin}</td>
                  <td>{claim.description || "(Không có mô tả)"}</td>
                  <td>
                    {claim.date
                      ? new Date(claim.date).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    <span className={`status ${claim.status}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Button
                      className="btn-view"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      Xem
                    </Button>
                    <Button
                      className="btn-accept"
                      onClick={() => updateClaimStatus(claim.id, "approved")}
                      disabled={loading}
                    >
                      <FaCheck />
                    </Button>
                    <Button
                      className="btn-reject"
                      onClick={() => updateClaimStatus(claim.id, "rejected")}
                      disabled={loading}
                    >
                      <FaTimes />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {/* Modal chi tiết claim */}
      {selectedClaim && (
        <div className="modal-container">
          <h3>
            Chi tiết hồ sơ bảo hành
            <span
              className="modal-close-icon"
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
            <div className="attachments">
              <h4>Tài liệu đính kèm:</h4>
              <div className="attachments-list">
                {renderAttachments(selectedClaim.attachments)}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <Button
              className="btn-accept"
              onClick={() => updateClaimStatus(selectedClaim.id, "approved")}
              disabled={loading}
            >
              <FaCheck /> Chấp nhận
            </Button>
            <Button
              className="btn-reject"
              onClick={() => updateClaimStatus(selectedClaim.id, "rejected")}
              disabled={loading}
            >
              <FaTimes /> Từ chối
            </Button>
          </div>
        </div>
      )}

      {/* Popup xem ảnh to */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-preview-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="image-preview-close"
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
