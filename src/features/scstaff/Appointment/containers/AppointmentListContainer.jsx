/* File: AppointmentListContainer.js (Sửa lỗi "Trang trắng")
  - Sửa lỗi: Chỉ render RescheduleModal khi isRescheduleOpen=true.
  - Đã bao gồm logic useRef để mở modal an toàn.
*/
import React, { useState, useEffect, useCallback, useRef } from "react";
import AppointmentList from "../components/AppointmentList";
import AppointmentCreateModal from "../components/AppointmentCreateModal";
import AppointmentViewModal from "../components/AppointmentViewModal";
// IMPORT MODAL MỚI
import AppointmentRescheduleModal from "../components/AppointmentRescheduleModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";

/*
  Container: AppointmentListContainer

 
  Điểm quan trọng:
  - Dùng `latestRequestRef` để tránh race condition khi user thay đổi nhanh page/filter
  - `fetchTimeSlots` và `createAppointment` được export/định nghĩa ở đây để modal/form
    có thể gọi lại mà không phải biết chi tiết API.
*/

export const AppointmentListContainer = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  // Appointment đang được xem chi tiết
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // Điều khiển hiển thị modal xem chi tiết
  const [showViewModal, setShowViewModal] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Ref để chống race condition khi dời lịch
  const isRescheduling = useRef(false);

  // Ref giữ id request mới nhất để tránh race condition khi gọi API nhiều lần
  const latestRequestRef = useRef(0);
  // Danh sách service centers (dùng trong form tạo)
  const [centers, setCenters] = useState([]);

  // Hàm fetch dữ liệu appointments từ server
  // - useCallback để tránh tạo lại hàm ở mỗi render
  // - pageNumber/pageSize dùng để phân trang phía server
  const fetchAppointments = useCallback(async (pageNumber = 0, size = 10) => {
    // Tăng request id và lưu vào biến cục bộ để check race khi response về
    const requestId = ++latestRequestRef.current;
    // Bật trạng thái loading và reset lỗi
    setLoading(true);
    setError(null);

    try {
      const res = await request(ApiEnum.APPOINTMENT, {
        Page: pageNumber,
        Size: size,
      });

      // Nếu có request mới hơn đã được gửi đi (latestRequestRef thay đổi)
      // thì bỏ qua response cũ này (tránh cập nhật state bằng dữ liệu lỗi thời)
      if (requestId !== latestRequestRef.current) return;

      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setAppointments(items);
      setPagination({
        pageNumber: res.data?.pageNumber ?? pageNumber,
        pageSize: res.data?.pageSize ?? size,
        totalRecords: res.data?.totalRecords ?? items.length,
      });
    } catch (err) {
      console.error("Fetch appointment error:", err);
      setError(err?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch service centers for the create form (delegated to container)
  // Lấy danh sách service centers một lần khi component mount
  // - mounted flag dùng để tránh gọi setState khi component đã unmount
  useEffect(() => {
    let mounted = true;
    const loadCenters = async () => {
      try {
        const res = await request(ApiEnum.ORGANIZATION, {});
        const data = Array.isArray(res) ? res : res?.data || [];
        // Nếu component đã unmount trước khi response về thì không setState
        if (!mounted) return;
        // Map payload về định dạng chung mà form cần (fallback nhiều trường khác nhau)
        setCenters(
          data.map((o) => ({
            id:
              o.id ?? o.orgId ?? o.organizationId ?? o._id ?? o.org_id ?? null,
            name: o.name ?? o.orgName ?? o.title ?? "",
            region: o.region ?? o.location ?? "",
            contact: o.contact ?? o.contactInfo ?? o.phone ?? o.email ?? "",
            _raw: o,
          }))
        );
      } catch (err) {
        console.error("Failed to load centers:", err);
      }
    };
    loadCenters();
    // Cleanup: trước khi unmount, set mounted false để response sau đó bỏ qua
    return () => {
      mounted = false;
    };
  }, []);

  // Delegate fetching timeslots to container so modal/form can call it
  // Hàm lấy timeslots cho service center + ngày cụ thể
  // - Trả về mảng slot hoặc [] nếu lỗi/thiếu param
  const fetchTimeSlots = async (orgId, date) => {
    if (!orgId || !date) return [];
    try {
      const res = await request(ApiEnum.APPOINTMENT_TIMESLOTS, { orgId, date });
      const data = Array.isArray(res) ? res : res?.data || [];
      return data;
    } catch (err) {
      console.error("Failed to fetch timeslots:", err);
      return [];
    }
  };

  // Hàm tạo appointment (được truyền xuống form)
  // - Sau khi tạo thành công sẽ gọi lại fetchAppointments để refresh danh sách
  const createAppointment = async (payload) => {
    try {
      const res = await request(ApiEnum.APPOINTMENT_CREATE, payload);
      await fetchAppointments(pagination.pageNumber, pagination.pageSize);
      return res.data;
    } catch (err) {
      console.error("Create appointment failed:", err);
      throw err;
    }
  };

  // Khi component mount hoặc pagination thay đổi thì fetch lại danh sách
  useEffect(() => {
    fetchAppointments(pagination.pageNumber, pagination.pageSize);
  }, [fetchAppointments, pagination.pageNumber, pagination.pageSize]);

  // Callback khi user đổi trang/trangSize ở DataTable
  const handlePageChange = (pageIndex, newPageSize) => {
    fetchAppointments(pageIndex, newPageSize ?? pagination.pageSize);
  };

  // Callback để refresh dữ liệu theo trang hiện tại (ví dụ: từ nút refresh)
  const handleRefresh = useCallback(() => {
    fetchAppointments(pagination.pageNumber, pagination.pageSize);
  }, [fetchAppointments, pagination.pageNumber, pagination.pageSize]);

  // Khi form tạo appointment báo thành công
  const handleAddSuccess = () => {
    setShowAddModal(false);
    toast.success("Appointment created successfully!");
    handleRefresh();
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // === START: CÁC HÀM ACTIONS ĐÃ SỬA ===

  // Hàm mới để xử lý đóng modal an toàn
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    if (!isRescheduling.current) {
      setSelectedAppointment(null);
    }
    // *Không* reset ref ở đây.
  };

  // Hàm mới để đóng Reschedule Modal
  const handleCloseRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedAppointment(null);
    isRescheduling.current = false;
  };

  // Hàm chung (Đã sửa payload)
  const callAppointmentAction = async (
    apiEnum,
    payload, // { params: { ... }, ...body }
    successMsg
  ) => {
    try {
      await request(apiEnum, payload);
      toast.success(successMsg);
      handleRefresh();
      setShowViewModal(false);
      setIsRescheduleOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error(`${successMsg} error:`, err);
      toast.error(
        err?.responseData?.message || `Action failed: ${err.message}`
      );
      throw err;
    }
  };

  const handleCheckIn = (appointmentId) => {
    callAppointmentAction(
      ApiEnum.APPOINTMENT_CHECKIN,
      { params: { appointmentId } },
      "Appointment checked in!"
    );
  };

  const handleNoShow = (appointmentId) => {
    callAppointmentAction(
      ApiEnum.APPOINTMENT_NOSHOW,
      { params: { appointmentId } },
      "Marked as No-Show!"
    );
  };

  const handleCancel = (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    callAppointmentAction(
      ApiEnum.APPOINTMENT_CANCEL,
      { params: { appointmentId } },
      "Appointment cancelled."
    );
  };

  const handleDone = (appointmentId) => {
    callAppointmentAction(
      ApiEnum.APPOINTMENT_DONE,
      { params: { appointmentId } },
      "Appointment marked as Done!"
    );
  };

  // Cập nhật hàm click dời lịch
  const handleRescheduleClick = () => {
    isRescheduling.current = true;
    setShowViewModal(false);
    setIsRescheduleOpen(true);
  };

  // (Đã sửa payload)
  const handleRescheduleSubmit = async (newDate, newSlot) => {
    if (!selectedAppointment) return;

    await callAppointmentAction(
      ApiEnum.APPOINTMENT_RESCHEDULE,
      {
        params: { appointmentId: selectedAppointment.id },
        appointmentDate: newDate,
        slot: newSlot,
      },
      "Appointment rescheduled!"
    );
  };

  // === END: CÁC HÀM ACTIONS ĐÃ SỬA ===

  return (
    <>
      <AppointmentList
        data={appointments}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        onAdd={() => setShowAddModal(true)}
        onView={handleView}
      />

      <AppointmentViewModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        appointment={selectedAppointment}
        onCheckIn={handleCheckIn}
        onNoShow={handleNoShow}
        onCancel={handleCancel}
        onDone={handleDone}
        onRescheduleClick={handleRescheduleClick}
      />

      <AppointmentCreateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        centers={centers}
        fetchTimeSlots={fetchTimeSlots}
        createAppointment={createAppointment}
      />

      {/* === SỬA LỖI: Thêm {isRescheduleOpen && ...} === */}
      {isRescheduleOpen && (
        <AppointmentRescheduleModal
          isOpen={isRescheduleOpen}
          onClose={handleCloseRescheduleModal}
          appointment={selectedAppointment}
          fetchTimeSlots={fetchTimeSlots}
          onSubmit={handleRescheduleSubmit}
        />
      )}
      {/* === KẾT THÚC SỬA LỖI === */}
    </>
  );
};
