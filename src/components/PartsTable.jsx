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
//         .filter((part) => part.quantity > 0) // Remove parts with quantity 0
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
//                     {categories.map((cat) => (
//                       <option key={cat.id || cat.name} value={cat.name}>
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
//                     {models.map((model) => (
//                       <option key={model.id || model.name} value={model.name}>
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Lấy danh mục linh kiện
  const fetchCategories = async () => {
    try {
      const response = await request(ApiEnum.GET_PART_CATEGORY);
      if (response.success) {
        setCategories(response.data || []);
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
      const response = await request(
        `${ApiEnum.GET_PART_MODEL}?category=${encodeURIComponent(categoryName)}`
      );
      if (response.success) {
        setModels(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleAddPart = () => {
    const newPart = {
      id: Date.now(),
      action: "Replace",
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

  const handleUpdatePart = (id, field, value) => {
    setParts(
      parts.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
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
                {/* Action */}
                <td>
                  <select
                    className="parts-select"
                    value={part.action}
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
                    onChange={(e) =>
                      handleUpdatePart(part.id, "category", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((cat, index) => (
                      <option key={`cat-${cat.id ?? index}`} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Model */}
                <td>
                  <select
                    className="parts-select"
                    value={part.model}
                    onChange={(e) =>
                      handleUpdatePart(part.id, "model", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {models.map((model, index) => (
                      <option
                        key={`model-${model.id ?? index}`}
                        value={model.name}
                      >
                        {model.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Serial */}
                <td>
                  <input
                    type="text"
                    className="parts-input"
                    placeholder="Nhập serial..."
                    value={part.serial}
                    onChange={(e) =>
                      handleUpdatePart(part.id, "serial", e.target.value)
                    }
                  />
                </td>

                {/* New Serial (only for Repair task) */}
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

                {/* Quantity */}
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

                {/* Remove */}
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
