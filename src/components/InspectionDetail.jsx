import React from "react";
import "./InspectionDetail.css";

//  *   - detail: Object chứa { description: string, images: string[] }
export default function InspectionDetail({ detail }) {
  // Nếu không có dữ liệu inspection, hiển thị thông báo
  if (!detail) {
    return <p className="no-data">No inspection detail available</p>;
  }

  // Đảm bảo images là một mảng (tránh crash nếu BE trả null)
  const images = Array.isArray(detail.images) ? detail.images : [];

  return (
    <div className="inspection-detail">
      {/* Mô tả nội dung kiểm tra */}
      <p className="inspection-text">
        {detail.description || "No description available"}
      </p>

      {/* Hiển thị danh sách ảnh nếu có */}
      {images.length > 0 ? (
        <div className="inspection-images">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`inspection-${idx}`}
              className="inspection-img"
              // Nếu ảnh lỗi (404...), ẩn nó đi
              onError={(e) => (e.target.style.display = "none")}
            />
          ))}
        </div>
      ) : (
        <p className="no-data">No images available</p>
      )}
    </div>
  );
}
