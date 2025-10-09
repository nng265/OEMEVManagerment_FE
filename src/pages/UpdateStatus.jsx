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

//   // 🟢 Load dữ liệu ban đầu
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [claimsRes, vehiclesRes] = await Promise.all([
//           fetch("http://localhost:3001/claims"),
//           fetch("http://localhost:3001/vehicles"),
//         ]);
//         const claimsData = await claimsRes.json();
//         const vehiclesData = await vehiclesRes.json();
//         setClaims(claimsData);
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

//   // 🟡 Lưu claim
//   const onSave = async (payload, actionType) => {
//     if (!selectedClaim) return;
//     setSubmitting(true);
//     try {
//       const updatedClaim = {
//         ...selectedClaim,
//         description: payload.description || selectedClaim.description,
//         attachments: payload.attachments || selectedClaim.attachments || [],
//         parts: payload.parts || selectedClaim.parts || [], // 🆕 Lưu cả danh sách linh kiện
//       };

//       if (actionType === "send_staff") {
//         updatedClaim.status = "waiting_staff";
//       } else if (selectedClaim.status !== "waiting_staff") {
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

//   // 🔍 Lọc danh sách claim
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
//   const [attachments, setAttachments] = useState(claim.attachments || []);
//   const [newFiles, setNewFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [zoomedImage, setZoomedImage] = useState(null);
//   const [parts, setParts] = useState(
//     claim.parts || [{ type: "", category: "", model: "", quantity: 1 }]
//   );

//   // 🟢 Preview ảnh mới upload
//   useEffect(() => {
//     if (!newFiles.length) {
//       setPreviewUrls([]);
//       return;
//     }
//     const urls = newFiles.map((f) => URL.createObjectURL(f));
//     setPreviewUrls(urls);
//     return () => urls.forEach((u) => URL.revokeObjectURL(u));
//   }, [newFiles]);

//   // 🧩 Xử lý linh kiện
//   const handlePartChange = (index, field, value) => {
//     const updated = [...parts];
//     updated[index][field] = value;
//     setParts(updated);
//   };

//   const handleQuantity = (index, change) => {
//     const updated = [...parts];
//     updated[index].quantity += change;

//     if (updated[index].quantity <= 0) {
//       updated.splice(index, 1);

//       // ✅ Nếu sau khi xóa mà mảng trống → thêm 1 dòng mặc định
//       if (updated.length === 0) {
//         updated.push({ type: "", category: "", model: "", quantity: 1 });
//       }
//     }

//     setParts(updated);
//   };

//   const addPartRow = () => {
//     setParts([...parts, { type: "", category: "", model: "", quantity: 1 }]);
//   };

//   // 🟡 Upload ảnh
//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     setNewFiles((prev) => [...prev, ...files]);
//   };

//   const removeOldAttachment = (index) => {
//     setAttachments((prev) => prev.filter((_, i) => i !== index));
//   };

//   const removeNewFile = (index) => {
//     setNewFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   // 🟡 Submit form
//   const handleSubmit = async (actionType) => {
//     const newFileUrls = newFiles.map((f) => URL.createObjectURL(f));
//     const payload = {
//       description,
//       attachments: [...attachments, ...newFileUrls],
//       parts: parts,
//     };
//     await onSave(payload, actionType);
//   };

//   // ✅ Kiểm tra tất cả linh kiện đều hợp lệ
//   const allPartsValid =
//     parts.length > 0 &&
//     parts.every((p) => p.type && p.category && p.model && p.quantity > 0);

//   // ✅ Kiểm tra mô tả có nội dung
//   const hasDescription = description.trim().length > 0;

//   // ✅ Điều kiện để bật nút "Gửi Staff"
//   const isValidForSend = allPartsValid && hasDescription;

//   return (
//     <div className="update-modal__overlay">
//       <div className="update-modal__container">
//         <div className="update-modal__header">
//           <h5>{mode === "view" ? "Thông tin" : "Cập nhật tình trạng xe"}</h5>
//           <button className="update-modal__close" onClick={onClose}>
//             ×
//           </button>
//         </div>

//         <div className="update-modal__body">
//           <section className="update-modal__section">
//             <h5>Thông tin xe</h5>
//             <div className="update-modal__row">
//               <span>VIN:</span>
//               <span>{claim.vehicle?.vin || "-"}</span>
//             </div>
//             <div className="update-modal__row">
//               <span>Mẫu xe:</span>
//               <span>{claim.vehicle?.model || "-"}</span>
//             </div>
//             <div className="update-modal__row">
//               <span>Ngày mua:</span>
//               <span>{claim.vehicle?.purchaseDate || "-"}</span>
//             </div>
//             <div className="update-modal__row">
//               <span>Tình trạng:</span>
//               <span>{claim.vehicle?.status || "-"}</span>
//             </div>
//           </section>

//           {/* 📝 MÔ TẢ & ẢNH */}
//           {mode === "update" && (
//             <>
//               {/* Mô tả kiểm tra */}
//               <div className="update-modal__section">
//                 <div className="update-modal__label">Mô tả kiểm tra</div>
//                 <div className="update-modal__content">
//                   <textarea
//                     className="update-modal__textarea"
//                     rows={4}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Ảnh đã lưu */}
//               <div className="update-modal__section">
//                 <div className="update-modal__label">Ảnh đã lưu</div>
//                 <div className="update-modal__content">
//                   {attachments.length > 0 ? (
//                     <div className="image-preview-grid">
//                       {attachments.map((url, i) => (
//                         <div key={i} className="image-thumb">
//                           <img
//                             src={url}
//                             alt={`old-${i}`}
//                             onClick={() => setZoomedImage(url)}
//                           />
//                           <button
//                             className="remove-btn"
//                             onClick={() => removeOldAttachment(i)}
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="update-modal__empty-text">
//                       (Chưa có ảnh nào)
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Thêm file mới */}
//               <div className="update-modal__section">
//                 <div className="update-modal__label">Thêm file mới</div>
//                 <div className="update-modal__content">
//                   <label className="custom-upload-btn">
//                     + Thêm file
//                     <input
//                       type="file"
//                       multiple
//                       onChange={handleFileChange}
//                       hidden
//                     />
//                   </label>
//                   <span className="file-status">
//                     {newFiles.length > 0
//                       ? `${newFiles.length} file đã chọn`
//                       : "Chưa chọn file"}
//                   </span>

//                   {previewUrls.length > 0 && (
//                     <div className="image-preview-grid">
//                       {previewUrls.map((u, i) => (
//                         <div key={i} className="image-thumb">
//                           <img
//                             src={u}
//                             alt={`preview-${i}`}
//                             onClick={() => setZoomedImage(u)}
//                           />
//                           <button
//                             className="remove-btn"
//                             onClick={() => removeNewFile(i)}
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               {/* 🧰 FORM LINH KIỆN */}
//               {/* Linh kiện sửa chữa / thay thế */}
//               <div className="update-modal__section update-modal__block update-parts-section">
//                 <div className="update-modal__label">
//                   Linh kiện sửa chữa / thay thế
//                 </div>

//                 <div className="update-modal__content update-parts-content">
//                   {parts.map((p, i) => (
//                     <div key={i} className="update-parts-row">
//                       <select
//                         value={p.type}
//                         onChange={(e) =>
//                           handlePartChange(i, "type", e.target.value)
//                         }
//                       >
//                         <option value="">sửa chữa/thay thế</option>
//                         <option value="sửa chữa">Sửa chữa</option>
//                         <option value="thay thế">Thay thế</option>
//                       </select>

//                       <select
//                         value={p.category}
//                         onChange={(e) =>
//                           handlePartChange(i, "category", e.target.value)
//                         }
//                       >
//                         <option value="">Category</option>
//                         <option value="Gương">Gương</option>
//                         <option value="Đèn">Đèn</option>
//                         <option value="Pin">Pin</option>
//                         <option value="Bánh xe">Bánh xe</option>
//                       </select>

//                       <select
//                         value={p.model}
//                         onChange={(e) =>
//                           handlePartChange(i, "model", e.target.value)
//                         }
//                       >
//                         <option value="">Model</option>
//                         <option value="Model A">Model A</option>
//                         <option value="Model B">Model B</option>
//                         <option value="Model C">Model C</option>
//                       </select>

//                       <div className="update-quantity-control">
//                         <button onClick={() => handleQuantity(i, 1)}>▲</button>
//                         <span>{p.quantity}</span>
//                         <button onClick={() => handleQuantity(i, -1)}>▼</button>
//                       </div>
//                     </div>
//                   ))}

//                   {/* Nút thêm linh kiện */}
//                   <div className="update-add-part-container">
//                     <button className="btn-add-part" onClick={addPartRow}>
//                       + Thêm linh kiện
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* 👀 Chế độ xem ảnh */}
//           {mode === "view" && attachments.length > 0 && (
//             <>
//               <h5>Hình ảnh đính kèm</h5>
//               <div className="update-modal__preview-list">
//                 {attachments.map((url, i) => (
//                   <img
//                     key={i}
//                     src={url}
//                     alt={`img-${i}`}
//                     onClick={() => setZoomedImage(url)}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         <div className="update-modal__footer">
//           <button
//             className="update-btn update-btn-secondary"
//             onClick={onClose}
//             disabled={uploading}
//           >
//             Đóng
//           </button>

//           {mode === "update" && (
//             <>
//               <button
//                 className="update-btn update-btn-outline"
//                 onClick={() => handleSubmit("save_only")}
//                 disabled={uploading}
//               >
//                 {uploading ? "Đang lưu..." : "Lưu"}
//               </button>
//               <button
//                 className={`update-btn update-btn-primary ${
//                   !isValidForSend ? "disabled" : ""
//                 }`}
//                 onClick={() => handleSubmit("send_staff")}
//                 disabled={uploading || !isValidForSend}
//                 title={
//                   !isValidForSend ? "Vui lòng nhập đủ mô tả và linh kiện" : ""
//                 }
//               >
//                 {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {zoomedImage && (
//         <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
//           <img src={zoomedImage} alt="zoomed" className="zoomed-img" />
//         </div>
//       )}
//     </div>
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

  // 🟢 Load dữ liệu ban đầu
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

  // 🟡 Lưu claim
  const onSave = async (payload, actionType) => {
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const updatedClaim = {
        ...selectedClaim,
        description: payload.description || selectedClaim.description,
        attachments: payload.attachments || selectedClaim.attachments || [],
        parts: payload.parts || selectedClaim.parts || [], // 🆕 Lưu cả danh sách linh kiện
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
  const [zoomedImage, setZoomedImage] = useState(null);
  const [parts, setParts] = useState(
    claim.parts || [{ type: "", category: "", model: "", quantity: 1 }]
  );

  // 🟢 Preview ảnh mới upload
  useEffect(() => {
    if (!newFiles.length) {
      setPreviewUrls([]);
      return;
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  // 🧩 Xử lý linh kiện
  const handlePartChange = (index, field, value) => {
    const updated = [...parts];
    updated[index][field] = value;
    setParts(updated);
  };

  const handleQuantity = (index, change) => {
    const updated = [...parts];
    updated[index].quantity += change;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);

      // ✅ Nếu sau khi xóa mà mảng trống → thêm 1 dòng mặc định
      if (updated.length === 0) {
        updated.push({ type: "", category: "", model: "", quantity: 1 });
      }
    }

    setParts(updated);
  };

  const addPartRow = () => {
    setParts([...parts, { type: "", category: "", model: "", quantity: 1 }]);
  };

  // 🟡 Upload ảnh
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

  // 🟡 Submit form
  const handleSubmit = async (actionType) => {
    const newFileUrls = newFiles.map((f) => URL.createObjectURL(f));
    const payload = {
      description,
      attachments: [...attachments, ...newFileUrls],
      parts: parts,
    };
    await onSave(payload, actionType);
  };

  // ✅ Kiểm tra tất cả linh kiện đều hợp lệ
  const allPartsValid =
    parts.length > 0 &&
    parts.every((p) => p.type && p.category && p.model && p.quantity > 0);

  // ✅ Kiểm tra mô tả có nội dung
  const hasDescription = description.trim().length > 0;

  // ✅ Điều kiện để bật nút "Gửi Staff"
  const isValidForSend = allPartsValid && hasDescription;

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
          {mode === "view" && (
            <div className="update-modal__info-grid">
              {/* 🧭 Cột trái: Thông tin xe */}
              <section className="update-modal__section">
                <h5>Thông tin xe</h5>
                <div className="update-modal__row">
                  <span>VIN:</span>
                  <span>{claim.vehicle?.vin || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Model:</span>
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

              {/* 🧰 Cột phải: Chi tiết công việc */}
              <section className="update-modal__section">
                <h5>Chi tiết công việc</h5>

                <div className="update-modal__row">
                  <span>Loại công việc:</span>
                  <span>{claim.jobType || "-"}</span>
                </div>

                <div className="update-modal__row">
                  <span>Ngày phân công:</span>
                  <span>{claim.assignedDate || "-"}</span>
                </div>
                <div className="update-modal__row">
                  <span>Mô tả:</span>
                  <span>{claim.description || "-"}</span>
                </div>
              </section>
            </div>
          )}

          {/* 📝 MÔ TẢ & ẢNH */}
          {mode === "update" && (
            <>
              {/* Mô tả kiểm tra */}
              <div className="update-modal__section">
                <div className="update-modal__label">Mô tả kiểm tra</div>
                <div className="update-modal__content">
                  <textarea
                    className="update-modal__textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Ảnh đã lưu */}
              <div className="update-modal__section">
                <div className="update-modal__label">Ảnh đã lưu</div>
                <div className="update-modal__content">
                  {attachments.length > 0 ? (
                    <div className="image-preview-grid">
                      {attachments.map((url, i) => (
                        <div key={i} className="image-thumb">
                          <img
                            src={url}
                            alt={`old-${i}`}
                            onClick={() => setZoomedImage(url)}
                          />
                          <button
                            className="remove-btn"
                            onClick={() => removeOldAttachment(i)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="update-modal__empty-text">
                      (Chưa có ảnh nào)
                    </p>
                  )}
                </div>
              </div>

              {/* Thêm file mới */}
              <div className="update-modal__section">
                <div className="update-modal__label">Thêm file mới</div>
                <div className="update-modal__content">
                  <label className="custom-upload-btn">
                    + Thêm file
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  <span className="file-status">
                    {newFiles.length > 0
                      ? `${newFiles.length} file đã chọn`
                      : "Chưa chọn file"}
                  </span>

                  {previewUrls.length > 0 && (
                    <div className="image-preview-grid">
                      {previewUrls.map((u, i) => (
                        <div key={i} className="image-thumb">
                          <img
                            src={u}
                            alt={`preview-${i}`}
                            onClick={() => setZoomedImage(u)}
                          />
                          <button
                            className="remove-btn"
                            onClick={() => removeNewFile(i)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* 🧰 FORM LINH KIỆN */}
              {/* Linh kiện sửa chữa / thay thế */}
              <div className="update-modal__section update-modal__block update-parts-section">
                <div className="update-modal__label">
                  Linh kiện sửa chữa / thay thế
                </div>

                <div className="update-modal__content update-parts-content">
                  {parts.map((p, i) => (
                    <div key={i} className="update-parts-row">
                      <select
                        value={p.type}
                        onChange={(e) =>
                          handlePartChange(i, "type", e.target.value)
                        }
                      >
                        <option value="">Sửa chữa/Thay thế</option>
                        <option value="sửa chữa">Sửa chữa</option>
                        <option value="thay thế">Thay thế</option>
                      </select>

                      <select
                        value={p.category}
                        onChange={(e) =>
                          handlePartChange(i, "category", e.target.value)
                        }
                      >
                        <option value="">Category</option>
                        <option value="Gương">Gương</option>
                        <option value="Đèn">Đèn</option>
                        <option value="Pin">Pin</option>
                        <option value="Bánh xe">Bánh xe</option>
                      </select>

                      <select
                        value={p.model}
                        onChange={(e) =>
                          handlePartChange(i, "model", e.target.value)
                        }
                      >
                        <option value="">Model</option>
                        <option value="Model A">Model A</option>
                        <option value="Model B">Model B</option>
                        <option value="Model C">Model C</option>
                      </select>

                      <div className="update-quantity-control">
                        <button onClick={() => handleQuantity(i, 1)}>▲</button>
                        <span>{p.quantity}</span>
                        <button onClick={() => handleQuantity(i, -1)}>▼</button>
                      </div>
                    </div>
                  ))}

                  {/* Nút thêm linh kiện */}
                  <div className="update-add-part-container">
                    <button className="btn-add-part" onClick={addPartRow}>
                      + Thêm linh kiện
                    </button>
                  </div>
                </div>
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
                className={`update-btn update-btn-primary ${
                  !isValidForSend ? "disabled" : ""
                }`}
                onClick={() => handleSubmit("send_staff")}
                disabled={uploading || !isValidForSend}
                title={
                  !isValidForSend ? "Vui lòng nhập đủ mô tả và linh kiện" : ""
                }
              >
                {uploading ? "Đang gửi..." : "Gửi Staff duyệt"}
              </button>
            </>
          )}
        </div>
      </div>

      {zoomedImage && (
        <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="zoomed" className="zoomed-img" />
        </div>
      )}
    </div>
  );
}
