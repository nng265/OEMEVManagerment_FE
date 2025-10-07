// import React, { useState, useEffect } from "react";
// import "./UpdateStatus.css";

// export default function UpdateStatus() {
//   const [claims, setClaims] = useState([]);
//   const [vehicles, setVehicles] = useState([]);
//   const [selectedClaim, setSelectedClaim] = useState(null);
//   const [mode, setMode] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("all");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const claimsRes = await fetch("http://localhost:3001/claims");
//         const claimsData = await claimsRes.json();
//         setClaims(claimsData);

//         const vehiclesRes = await fetch("http://localhost:3001/vehicles");
//         const vehiclesData = await vehiclesRes.json();
//         setVehicles(vehiclesData);
//       } catch (err) {
//         console.error("Lỗi load data:", err);
//       }
//     };
//     fetchData();
//   }, []);

//   const openModal = (claim, type) => {
//     const vehicle = vehicles.find((v) => v.vin === claim.vin) || {};
//     setSelectedClaim({ ...claim, vehicle });
//     setMode(type);
//   };

//   const closeModal = () => {
//     setSelectedClaim(null);
//     setMode(null);
//   };

//   const onSave = async (payload, actionType) => {
//     if (!selectedClaim) return;
//     setSubmitting(true);
//     try {
//       const updatedClaim = {
//         ...selectedClaim,
//         description: payload.get("description") || selectedClaim.description,
//       };

//       // 🔹 Giữ nguyên trạng thái nếu đã gửi staff rồi
//       if (actionType === "send_staff") {
//         updatedClaim.status = "waiting_staff";
//       } else if (selectedClaim.status !== "waiting_staff") {
//         // Chỉ đổi về in_progress nếu chưa gửi staff
//         updatedClaim.status = "tech_in_progress";
//       }

//       await fetch(`http://localhost:3001/claims/${selectedClaim.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedClaim),
//       });

//       setClaims((prev) =>
//         prev.map((c) => (c.id === selectedClaim.id ? updatedClaim : c))
//       );

//       closeModal();
//       alert(
//         actionType === "send_staff" ? "Đã gửi Staff duyệt!" : "Lưu thành công !"
//       );
//     } catch (err) {
//       console.error(err);
//       alert("Lưu thất bại!");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const filteredClaims = claims.filter((c) => {
//     const vehicle = vehicles.find((v) => v.vin === c.vin) || {};
//     const searchString =
//       `${c.vin} ${vehicle.model} ${c.description}`.toLowerCase();
//     const matchesSearch = searchString.includes(searchTerm.toLowerCase());
//     const matchesFilter =
//       filterType === "all"
//         ? true
//         : c.jobType?.toLowerCase() === filterType.toLowerCase();
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="update-container">
//       <h2>Danh sách công việc được phân công</h2>

//       <div className="update-controls-bar">
//         <div className="update-search-box">
//           <input
//             type="text"
//             placeholder="Tìm kiếm theo VIN / mô tả..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           {searchTerm && (
//             <button
//               className="update-reset-btn"
//               onClick={() => setSearchTerm("")}
//             >
//               ×
//             </button>
//           )}
//         </div>

//         <select
//           className="update-filter-dropdown"
//           value={filterType}
//           onChange={(e) => setFilterType(e.target.value)}
//         >
//           <option value="all">Tất cả loại công việc</option>
//           <option value="bảo hành">Bảo hành</option>
//           <option value="sửa chữa">Sửa chữa</option>
//           <option value="khác">Khác</option>
//         </select>
//       </div>

//       <table className="update-table">
//         <thead>
//           <tr>
//             <th>VIN</th>
//             <th>Mẫu xe</th>
//             <th>Loại công việc</th>
//             <th>Mô tả</th>
//             <th>Lựa chọn</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredClaims.map((c) => (
//             <tr key={c.id}>
//               <td>{c.vin}</td>
//               <td>{vehicles.find((v) => v.vin === c.vin)?.model || "-"}</td>
//               <td>{c.jobType || "-"}</td>
//               <td>{c.description || "(Chưa có mô tả)"}</td>
//               <td>
//                 <button onClick={() => openModal(c, "view")}>Xem</button>
//                 <button onClick={() => openModal(c, "update")}>Cập nhật</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {selectedClaim && (
//         <ClaimModal
//           claim={selectedClaim}
//           mode={mode}
//           onClose={closeModal}
//           onSave={onSave}
//           uploading={submitting}
//         />
//       )}
//     </div>
//   );
// }

// function ClaimModal({ claim, mode, onClose, onSave, uploading }) {
//   const [description, setDescription] = useState(claim.description || "");
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [previewImage, setPreviewImage] = useState(null);

//   useEffect(() => {
//     setDescription(claim.description || "");
//     setSelectedFiles([]);
//   }, [claim]);

//   useEffect(() => {
//     if (!selectedFiles || selectedFiles.length === 0) {
//       setPreviewUrls([]);
//       return;
//     }
//     const urls = selectedFiles.map((f) => URL.createObjectURL(f));
//     setPreviewUrls(urls);
//     return () => urls.forEach((u) => URL.revokeObjectURL(u));
//   }, [selectedFiles]);

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     setSelectedFiles((prev) => [...prev, ...files]);
//   };

//   const removeSelectedFile = (index) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (actionType) => {
//     const fd = new FormData();
//     fd.append("description", description);
//     selectedFiles.forEach((f) => fd.append("attachments", f));
//     await onSave(fd, actionType);
//   };

//   return (
//     <>
//       <div className="update-modal__overlay">
//         <div className="update-modal__container">
//           <div className="update-modal__header">
//             <h5>{mode === "view" ? "Thông tin" : "Cập nhật tình trạng xe"}</h5>
//             <button className="update-modal__close" onClick={onClose}>
//               ×
//             </button>
//           </div>

//           <div className="update-modal__body">
//             {/* Hiển thị thông tin xe cho cả 2 chế độ */}
//             <section className="update-modal__section">
//               <h5>Thông tin xe</h5>
//               <div className="update-modal__row">
//                 <span>VIN:</span>
//                 <span>{claim.vehicle?.vin || "-"}</span>
//               </div>
//               <div className="update-modal__row">
//                 <span>Mẫu xe:</span>
//                 <span>{claim.vehicle?.model || "-"}</span>
//               </div>
//               <div className="update-modal__row">
//                 <span>Ngày mua:</span>
//                 <span>{claim.vehicle?.purchaseDate || "-"}</span>
//               </div>
//               <div className="update-modal__row">
//                 <span>Tình trạng:</span>
//                 <span>{claim.vehicle?.status || "-"}</span>
//               </div>
//             </section>

//             {/* Nếu là chế độ cập nhật thì thêm phần nhập mô tả + file */}
//             {mode === "update" && (
//               <>
//                 <label>Mô tả kiểm tra</label>
//                 <textarea
//                   className="update-modal__textarea"
//                   rows={4}
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                 />

//                 <input
//                   type="file"
//                   className="update-modal__file"
//                   multiple
//                   onChange={handleFileChange}
//                 />

//                 {previewUrls.length > 0 && (
//                   <div className="update-modal__preview-list">
//                     {previewUrls.map((u, i) => (
//                       <div key={i} className="update-modal__preview-item">
//                         <img
//                           src={u}
//                           alt={`preview-${i}`}
//                           onClick={() => setPreviewImage(u)}
//                         />
//                         <button
//                           className="update-modal__remove"
//                           onClick={() => removeSelectedFile(i)}
//                         >
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           <div className="update-modal__footer">
//             <button
//               className="update-btn update-btn-secondary"
//               onClick={onClose}
//               disabled={uploading}
//             >
//               Đóng
//             </button>
//             {mode === "update" && (
//               <>
//                 <button
//                   className="update-btn update-btn-outline"
//                   onClick={() => handleSubmit("save_only")}
//                   disabled={uploading}
//                 >
//                   {uploading ? "Đang lưu..." : "Lưu"}
//                 </button>
//                 <button
//                   className="update-btn update-btn-primary"
//                   onClick={() => handleSubmit("send_staff")}
//                   disabled={uploading}
//                 >
//                   {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import "./UpdateStatus.css";

export default function UpdateStatus() {
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [mode, setMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // 🔹 Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, vehiclesRes] = await Promise.all([
          fetch("http://localhost:3001/claims"),
          fetch("http://localhost:3001/vehicles"),
        ]);
        const claimsData = await claimsRes.json();
        const vehiclesData = await vehiclesRes.json();
        setClaims(claimsData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Lỗi load data:", err);
      }
    };
    fetchData();
  }, []);

  const openModal = (claim, type) => {
    const vehicle = vehicles.find((v) => v.vin === claim.vin) || {};
    setSelectedClaim({ ...claim, vehicle });
    setMode(type);
  };

  const closeModal = () => {
    setSelectedClaim(null);
    setMode(null);
  };

  // 🔹 Lưu claim (bao gồm ảnh)
  const onSave = async (payload, actionType) => {
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const updatedClaim = {
        ...selectedClaim,
        description: payload.description || selectedClaim.description,
        attachments: payload.attachments || selectedClaim.attachments || [],
      };

      if (actionType === "send_staff") {
        updatedClaim.status = "waiting_staff";
      } else if (selectedClaim.status !== "waiting_staff") {
        updatedClaim.status = "tech_in_progress";
      }

      await fetch(`http://localhost:3001/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClaim),
      });

      setClaims((prev) =>
        prev.map((c) => (c.id === selectedClaim.id ? updatedClaim : c))
      );

      closeModal();
      alert(
        actionType === "send_staff" ? "Đã gửi Staff duyệt!" : "Lưu thành công !"
      );
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔍 Lọc danh sách claim
  const filteredClaims = claims.filter((c) => {
    const vehicle = vehicles.find((v) => v.vin === c.vin) || {};
    const searchString =
      `${c.vin} ${vehicle.model} ${c.description}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all"
        ? true
        : c.jobType?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="update-container">
      <h2>Danh sách công việc được phân công</h2>

      <div className="update-controls-bar">
        <div className="update-search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo VIN / mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="update-reset-btn"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        <select
          className="update-filter-dropdown"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại công việc</option>
          <option value="bảo hành">Bảo hành</option>
          <option value="sửa chữa">Sửa chữa</option>
          <option value="khác">Khác</option>
        </select>
      </div>

      <table className="update-table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Mẫu xe</th>
            <th>Loại công việc</th>
            <th>Mô tả</th>
            <th>Lựa chọn</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.map((c) => (
            <tr key={c.id}>
              <td>{c.vin}</td>
              <td>{vehicles.find((v) => v.vin === c.vin)?.model || "-"}</td>
              <td>{c.jobType || "-"}</td>
              <td>{c.description || "(Chưa có mô tả)"}</td>
              <td>
                <button onClick={() => openModal(c, "view")}>Xem</button>
                <button onClick={() => openModal(c, "update")}>Cập nhật</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedClaim && (
        <ClaimModal
          claim={selectedClaim}
          mode={mode}
          onClose={closeModal}
          onSave={onSave}
          uploading={submitting}
        />
      )}
    </div>
  );
}
function ClaimModal({ claim, mode, onClose, onSave, uploading }) {
  const [description, setDescription] = useState(claim.description || "");
  const [attachments, setAttachments] = useState(claim.attachments || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null); // 🟢 Thêm state zoom

  // Preview ảnh mới upload
  useEffect(() => {
    if (!newFiles.length) {
      setPreviewUrls([]);
      return;
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);
  };

  const removeOldAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (actionType) => {
    const newFileUrls = newFiles.map((f) => URL.createObjectURL(f));
    const payload = {
      description,
      attachments: [...attachments, ...newFileUrls],
    };
    await onSave(payload, actionType);
  };

  return (
    <div className="update-modal__overlay">
      <div className="update-modal__container">
        <div className="update-modal__header">
          <h5>{mode === "view" ? "Thông tin" : "Cập nhật tình trạng xe"}</h5>
          <button className="update-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="update-modal__body">
          <section className="update-modal__section">
            <h5>Thông tin xe</h5>
            <div className="update-modal__row">
              <span>VIN:</span>
              <span>{claim.vehicle?.vin || "-"}</span>
            </div>
            <div className="update-modal__row">
              <span>Mẫu xe:</span>
              <span>{claim.vehicle?.model || "-"}</span>
            </div>
            <div className="update-modal__row">
              <span>Ngày mua:</span>
              <span>{claim.vehicle?.purchaseDate || "-"}</span>
            </div>
            <div className="update-modal__row">
              <span>Tình trạng:</span>
              <span>{claim.vehicle?.status || "-"}</span>
            </div>
          </section>

          {mode === "update" && (
            <>
              <label>Mô tả kiểm tra</label>
              <textarea
                className="update-modal__textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label>Ảnh đã lưu</label>
              <div className="update-modal__preview-list">
                {attachments.length > 0 ? (
                  attachments.map((url, i) => (
                    <div key={i} className="update-modal__preview-item">
                      <img
                        src={url}
                        alt={`old-${i}`}
                        onClick={() => setZoomedImage(url)} // 🟢 click để zoom
                      />
                      <button
                        className="update-modal__remove"
                        onClick={() => removeOldAttachment(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>(Chưa có ảnh nào)</p>
                )}
              </div>

              <label>Thêm ảnh mới</label>
              <input
                type="file"
                className="update-modal__file"
                multiple
                onChange={handleFileChange}
              />

              {previewUrls.length > 0 && (
                <div className="update-modal__preview-list">
                  {previewUrls.map((u, i) => (
                    <div key={i} className="update-modal__preview-item">
                      <img
                        src={u}
                        alt={`preview-${i}`}
                        onClick={() => setZoomedImage(u)} // 🟢 zoom cho ảnh mới chọn
                      />
                      <button
                        className="update-modal__remove"
                        onClick={() => removeNewFile(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {mode === "view" && attachments.length > 0 && (
            <>
              <h5>Hình ảnh đính kèm</h5>
              <div className="update-modal__preview-list">
                {attachments.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`img-${i}`}
                    onClick={() => setZoomedImage(url)} // 🟢 zoom khi xem
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="update-modal__footer">
          <button
            className="update-btn update-btn-secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Đóng
          </button>
          {mode === "update" && (
            <>
              <button
                className="update-btn update-btn-outline"
                onClick={() => handleSubmit("save_only")}
                disabled={uploading}
              >
                {uploading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                className="update-btn update-btn-primary"
                onClick={() => handleSubmit("send_staff")}
                disabled={uploading}
              >
                {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🟢 Overlay zoom ảnh */}
      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="zoomed" className="zoomed-img" />
        </div>
      )}
    </div>
  );
}
