# Warranty Bill Feature - Implementation Guide

## Tổng quan

Đã thêm chức năng xem và tải PDF bill cho warranty claims khi khách hàng nhận xe. Bill sẽ hiển thị các thông tin khác nhau tùy theo trạng thái (Denied hoặc Repaired).

## Files đã tạo/cập nhật

### Files mới:
1. **WarrantyBillPDF.jsx** - Component hiển thị nội dung bill
2. **WarrantyBillPDF.css** - Styling cho bill PDF
3. **WarrantyBillModal.jsx** - Modal để xem và tải bill
4. **WarrantyBillModal.css** - Styling cho modal

### Files đã cập nhật:
1. **DeniedOrRepairedClaimModal.jsx** - Thêm nút "View Bill"
2. **Button.css** - Thêm styles cho btn-light và btn-dark variants

## Chức năng

### Khi status là "Denied":
Bill hiển thị:
- Thông tin khách hàng và xe
- Mô tả của kỹ thuật viên
- Hình ảnh đính kèm
- Các hồ sơ bảo hành đang được áp dụng (warranty policies)
- Ô chữ ký cho cả service center và khách hàng

### Khi status là "Repaired":
Bill hiển thị:
- Thông tin khách hàng và xe
- Mô tả lỗi (failureDesc, description)
- **Thông tin hồ sơ bảo hành được chấp nhận** (Approved Warranty Coverage):
  - Tên policy được áp dụng (policyName)
- Hình ảnh đính kèm
- Thông tin chi tiết về sửa chữa/thay thế linh kiện:
  - Action (Replace/Repair)
  - Tên linh kiện (Model)
  - Số serial cũ (serialNumberOld)
  - Số serial mới (serialNumberNew) - nếu có
- Ô chữ ký cho cả service center và khách hàng (với tên thật)

## Cách sử dụng

1. Khi khách hàng nhận xe (status là Denied hoặc Repaired), modal sẽ hiển thị 2 nút:
   - **View Bill** - Xem preview bill
   - **Customer Get Car** - Xác nhận khách hàng đã nhận xe

2. Khi click "View Bill", một modal mới sẽ hiển thị với:
   - Preview của bill PDF
   - 3 nút actions:
     - **Download PDF** - Tải bill dưới dạng PDF
     - **Print** - In bill
     - **Close** - Đóng modal

## Cấu trúc dữ liệu warrantyData

```javascript
{
  warrantyClaimId: string | number,
  status: "denied" | "repaired",
  customerName: string,
  customerPhoneNumber: string,
  vin: string,
  model: string,
  year: string | number,
  description: string,
  technicianDescription: string,  // Dùng cho denied
  failureDesc: string,
  
  // Hình ảnh
  attachments: [
    {
      url: string,
      attachmentId: string | number
    }
  ],
  
  // Warranty policies (cho denied)
  showPolicy: [
    {
      policyType: string,
      duration: number,
      mileageLimit: number,
      coverageDetails: string
    }
  ],
  
  // Parts replaced/repaired (cho repaired)
  showClaimParts: [
    {
      action: string,           // "Replace", "Repair"
      model: string,            // Tên linh kiện
      serialNumberOld: string,  // Số serial cũ
      serialNumberNew: string   // Số serial mới (nếu replace)
    }
  ]
}
```

## Dependencies đã cài đặt

- `jspdf` - Tạo PDF files
- `html2canvas` - Chuyển HTML thành canvas để tạo PDF

## Styling

Bill được thiết kế theo định dạng A4 (210mm x 297mm) và hỗ trợ:
- In trực tiếp từ trình duyệt
- Xuất PDF với chất lượng cao (scale 2x)
- Responsive design
- Professional layout với bảng, grid, và signature boxes

## Lưu ý

1. Để bill hiển thị đầy đủ, cần đảm bảo API trả về đầy đủ các fields trong warrantyData
2. Hình ảnh trong bill cần có CORS enabled để html2canvas có thể render
3. Bill sẽ tự động chia thành nhiều trang nếu nội dung dài
4. Tên file PDF được tạo theo format: `Warranty_Bill_[ClaimID]_[Timestamp].pdf`
