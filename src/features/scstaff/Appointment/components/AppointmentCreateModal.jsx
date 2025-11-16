import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../../../../components/molecules/Modal/Modal";
import AppointmentForm from "./AppointmentForm"; // Form 4 bước sẽ ở đây
import "./AppointmentForm.css"; // CSS đã được refactor (Bước 4)

/*
  - Đây là modal bọc ngoài cho form tạo lịch hẹn (AppointmentForm).
  - Component này chỉ chịu trách nhiệm hiển thị Modal và truyền các props
    cần thiết (centers, fetchTimeSlots, createAppointment, onSuccess, onClose)
    xuống component con.

  Props:
  - isOpen: boolean => điều khiển hiển thị Modal
  - onClose: function => callback đóng Modal
  - onSuccess: function => callback khi tạo thành công (gọi từ form)
  - centers, timeSlots, fetchTimeSlots, createAppointment: dữ liệu/func hỗ trợ form

  Lưu ý:
  - Không thực hiện logic mạng hay state phức tạp tại đây; tất cả delegare
    cho `AppointmentForm` hoặc container quản lý (container cung cấp create func).
*/

export const AppointmentCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  centers,
  timeSlots,
  fetchTimeSlots,
  createAppointment,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Create New Appointment"
      onClose={onClose}
      showFooter={false}
      size="xl"
    >
      <div className="appointment-modal-body">
        <AppointmentForm
          onSuccess={onSuccess}
          onClose={onClose}
          centers={centers}
          timeSlots={timeSlots}
          fetchTimeSlots={fetchTimeSlots}
          createAppointment={createAppointment}
        />
      </div>
    </Modal>
  );
};

AppointmentCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AppointmentCreateModal;
