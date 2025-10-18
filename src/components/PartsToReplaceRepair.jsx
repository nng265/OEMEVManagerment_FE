import React from "react";
import "./PartsToReplaceRepair.css";

/**
 * Component: PartsToReplaceRepair
 * Mục đích:
 *   - Hiển thị danh sách linh kiện cần thay thế hoặc sửa chữa.
 *   - Chỉ để hiển thị (không cho thêm / sửa / xóa).
 *
 * Props:
 *   - parts: Mảng chứa các linh kiện [{ action, category, model, serial }, ...]
 */
export default function PartsToReplaceRepair({ parts }) {
  // Nếu không có dữ liệu hợp lệ, hiển thị thông báo "No data"
  if (!Array.isArray(parts) || parts.length === 0) {
    return <p className="no-data">No parts to replace or repair</p>;
  }

  return (
    <table className="parts-table">
      <thead>
        <tr>
          <th>Action</th>
          <th>Category</th>
          <th>Model</th>
          <th>Serial</th>
        </tr>
      </thead>

      <tbody>
        {parts.map((p, idx) => (
          <tr key={p.id || idx}>
            <td>{p.action || "—"}</td>
            <td>{p.category || "—"}</td>
            <td>{p.model || "—"}</td>
            <td>{p.serial || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
