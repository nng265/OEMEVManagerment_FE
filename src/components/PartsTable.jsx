// import React, { useState, useEffect } from "react";
// import "./PartsTable.css";
// import { request, ApiEnum } from "../services/NetworkUntil";

// export default function PartsTable({ parts, setParts, isRepair }) {
//   const [categories, setCategories] = useState([]);
//   const [models, setModels] = useState([]);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // 🔹 Lấy danh mục linh kiện
//   const fetchCategories = async () => {
//     try {
//       const response = await request(ApiEnum.GET_PART_CATEGORY);
//       if (response.success) {
//         setCategories(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   // 🔹 Lấy danh sách model theo category
//   const fetchModels = async (categoryName) => {
//     try {
//       if (!categoryName) {
//         setModels([]);
//         return;
//       }
//       const response = await request(
//         `${ApiEnum.GET_PART_MODEL}?category=${encodeURIComponent(categoryName)}`
//       );
//       if (response.success) {
//         setModels(response.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching models:", error);
//     }
//   };

//   const handleAddPart = () => {
//     const newPart = {
//       id: Date.now(),
//       action: "Replace",
//       category: "",
//       model: "",
//       serial: "",
//       newSerial: "",
//       quantity: 1,
//     };
//     setParts([...parts, newPart]);
//   };

//   const handleRemovePart = (id) => {
//     setParts(parts.filter((part) => part.id !== id));
//   };

//   const handleUpdatePart = (id, field, value) => {
//     setParts(
//       parts.map((part) => (part.id === id ? { ...part, [field]: value } : part))
//     );
//   };

//   const handleQuantityChange = (id, delta) => {
//     setParts(
//       parts
//         .map((part) => {
//           if (part.id === id) {
//             const newQuantity = Math.max(0, part.quantity + delta);
//             return { ...part, quantity: newQuantity };
//           }
//           return part;
//         })
//         .filter((part) => part.quantity > 0)
//     );
//   };

//   return (
//     <div className="parts-table-container">
//       <table className="parts-table">
//         <thead>
//           <tr>
//             <th>Hạng mục công việc</th>
//             <th>Tên linh kiện</th>
//             <th>Mẫu</th>
//             <th>Serial</th>
//             {isRepair && <th>Serial mới</th>}
//             <th>Số lượng</th>
//             <th>Thao tác</th>
//           </tr>
//         </thead>
//         <tbody>
//           {parts.length === 0 ? (
//             <tr>
//               <td colSpan={isRepair ? "7" : "6"} className="parts-empty">
//                 Chưa có linh kiện nào. Nhấn "Thêm linh kiện" để bắt đầu.
//               </td>
//             </tr>
//           ) : (
//             parts.map((part) => (
//               <tr key={part.id}>
//                 {/* Action */}
//                 <td>
//                   <select
//                     className="parts-select"
//                     value={part.action}
//                     onChange={(e) =>
//                       handleUpdatePart(part.id, "action", e.target.value)
//                     }
//                   >
//                     <option value="">-- Chọn --</option>
//                     <option value="Replace">Thay thế</option>
//                     <option value="Repair">Sửa chữa</option>
//                   </select>
//                 </td>

//                 {/* Category */}
//                 <td>
//                   <select
//                     className="parts-select"
//                     value={part.category}
//                     onChange={(e) =>
//                       handleUpdatePart(part.id, "category", e.target.value)
//                     }
//                   >
//                     <option value="">-- Chọn --</option>
//                     {categories.map((cat, index) => (
//                       <option key={`cat-${cat.id ?? index}`} value={cat.name}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 </td>

//                 {/* Model */}
//                 <td>
//                   <select
//                     className="parts-select"
//                     value={part.model}
//                     onChange={(e) =>
//                       handleUpdatePart(part.id, "model", e.target.value)
//                     }
//                   >
//                     <option value="">-- Chọn --</option>
//                     {models.map((model, index) => (
//                       <option
//                         key={`model-${model.id ?? index}`}
//                         value={model.name}
//                       >
//                         {model.name}
//                       </option>
//                     ))}
//                   </select>
//                 </td>

//                 {/* Serial */}
//                 <td>
//                   <input
//                     type="text"
//                     className="parts-input"
//                     placeholder="Nhập serial..."
//                     value={part.serial}
//                     onChange={(e) =>
//                       handleUpdatePart(part.id, "serial", e.target.value)
//                     }
//                   />
//                 </td>

//                 {/* New Serial (only for Repair task) */}
//                 {isRepair && (
//                   <td>
//                     <input
//                       type="text"
//                       className="parts-input"
//                       placeholder="Serial mới..."
//                       value={part.newSerial}
//                       onChange={(e) =>
//                         handleUpdatePart(part.id, "newSerial", e.target.value)
//                       }
//                     />
//                   </td>
//                 )}

//                 {/* Quantity */}
//                 <td>
//                   <div className="parts-quantity">
//                     <button
//                       className="parts-quantity-btn"
//                       onClick={() => handleQuantityChange(part.id, -1)}
//                     >
//                       -
//                     </button>
//                     <span className="parts-quantity-value">
//                       {part.quantity}
//                     </span>
//                     <button
//                       className="parts-quantity-btn"
//                       onClick={() => handleQuantityChange(part.id, 1)}
//                     >
//                       +
//                     </button>
//                   </div>
//                 </td>

//                 {/* Remove */}
//                 <td>
//                   <button
//                     className="parts-remove-btn"
//                     onClick={() => handleRemovePart(part.id)}
//                     title="Xóa linh kiện"
//                   >
//                     ×
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       <button className="parts-add-btn" onClick={handleAddPart}>
//         ➕ Thêm linh kiện
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import "./PartsTable.css";
import { request, ApiEnum } from "../services/NetworkUntil";

export default function PartsTable({ parts, setParts, isRepair }) {
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [serials, setSerials] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Lấy danh mục linh kiện
  const fetchCategories = async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORY);
      console.log("Category response:", response);
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // 🔹 Lấy danh sách model theo category
  const fetchModels = async (categoryName) => {
    try {
      if (!categoryName) {
        setModels([]);
        return;
      }
      const response = await request(ApiEnum.GET_PART_MODEL, {
        category: categoryName,
      });
      console.log("Model response:", response);
      if (response.success && Array.isArray(response.data)) {
        setModels(response.data);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const fetchSerial = async (vin, modelName) => {
    // cái vin này đang lấy ở đâu
    try {
      if (!vin || !modelName) {
        setSerials([]);
        return;
      }

      const response = await request(ApiEnum.GET_PART_SERIAL, {
        vin: vin,
        model: modelName,
      });

      console.log("Serial response:", response);
      if (response.success && Array.isArray(response.data)) {
        setSerials(response.data);
      } else {
        setSerials([]);
      }
    } catch (error) {
      console.error("Error fetching serials:", error);
      setSerials([]);
    }
  };

  const handleAddPart = () => {
    const newPart = {
      id: Date.now(),
      action: "",
      category: "",
      model: "",
      serial: "",
      newSerial: "",
      quantity: 1,
    };
    setParts([...parts, newPart]);
  };

  const handleRemovePart = (id) => {
    setParts(parts.filter((part) => part.id !== id));
  };

  const handleUpdatePart = async (id, field, value) => {
    const updatedParts = parts.map((part) =>
      part.id === id ? { ...part, [field]: value } : part
    );
    setParts(updatedParts);

    // Nếu user chọn Category -> gọi API model tương ứng
    if (field === "category") {
      await fetchModels(value);
    }

    // Nếu user chọn Model -> gọi API serial tương ứng
    if (field === "model") {
      await fetchSerial(value);
    }
  };

  const handleQuantityChange = (id, delta) => {
    setParts(
      parts
        .map((part) => {
          if (part.id === id) {
            const newQuantity = Math.max(0, part.quantity + delta);
            return { ...part, quantity: newQuantity };
          }
          return part;
        })
        .filter((part) => part.quantity > 0)
    );
  };

  return (
    <div className="parts-table-container">
      <table className="parts-table">
        <thead>
          <tr>
            <th>Hạng mục công việc</th>
            <th>Tên linh kiện</th>
            <th>Mẫu</th>
            <th>Serial</th>
            {isRepair && <th>Serial mới</th>}
            <th>Số lượng</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {parts.length === 0 ? (
            <tr>
              <td colSpan={isRepair ? "7" : "6"} className="parts-empty">
                Chưa có linh kiện nào. Nhấn "Thêm linh kiện" để bắt đầu.
              </td>
            </tr>
          ) : (
            parts.map((part) => (
              <tr key={part.id}>
                {/* Hạng mục công việc */}
                <td>
                  <select
                    className="parts-select"
                    value={part.action}
                    title={part.action} // ✅ Thêm dòng này để hiện tooltip
                    onChange={(e) =>
                      handleUpdatePart(part.id, "action", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Replace">Thay thế</option>
                    <option value="Repair">Sửa chữa</option>
                  </select>
                </td>

                {/* Category */}
                <td>
                  <select
                    className="parts-select"
                    value={part.category}
                    title={part.category} // ✅ Thêm dòng này để hiện tooltip
                    onChange={(e) =>
                      handleUpdatePart(part.id, "category", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((cat, idx) => (
                      <option key={`cat-${idx}`} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Model */}
                <td>
                  <select
                    className="parts-select"
                    value={part.model}
                    title={part.model} // ✅ Thêm dòng này để hiện tooltip
                    onChange={(e) =>
                      handleUpdatePart(part.id, "model", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {models.map((model, idx) => (
                      <option key={`model-${idx}`} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Serial */}
                <td>
                  <select
                    type="text"
                    className="parts-input"
                    placeholder="Nhập serial..."
                    value={part.serial}
                    title={part.serial} // ✅ Thêm dòng này để hiện tooltip
                    onChange={(e) =>
                      handleUpdatePart(part.id, "serial", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {serials.map((serial, idx) => (
                      <option key={`serial-${idx}`} value={serial}>
                        {serial}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Serial mới (nếu là sửa chữa) */}
                {isRepair && (
                  <td>
                    <input
                      type="text"
                      className="parts-input"
                      placeholder="Serial mới..."
                      value={part.newSerial}
                      onChange={(e) =>
                        handleUpdatePart(part.id, "newSerial", e.target.value)
                      }
                    />
                  </td>
                )}

                {/* Số lượng */}
                <td>
                  <div className="parts-quantity">
                    <button
                      className="parts-quantity-btn"
                      onClick={() => handleQuantityChange(part.id, -1)}
                    >
                      -
                    </button>
                    <span className="parts-quantity-value">
                      {part.quantity}
                    </span>
                    <button
                      className="parts-quantity-btn"
                      onClick={() => handleQuantityChange(part.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* Xóa */}
                <td>
                  <button
                    className="parts-remove-btn"
                    onClick={() => handleRemovePart(part.id)}
                    title="Xóa linh kiện"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="parts-add-btn" onClick={handleAddPart}>
        ➕ Thêm linh kiện
      </button>
    </div>
  );
}
