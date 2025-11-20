import React, { useState, useEffect, useCallback, useRef } from "react";
import AppointmentList from "../components/AppointmentList";
import AppointmentCreateModal from "../components/AppointmentCreateModal";
import AppointmentViewModal from "../components/AppointmentViewModal";

import AppointmentRescheduleModal from "../components/AppointmentRescheduleModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";

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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const isRescheduling = useRef(false);

  const latestRequestRef = useRef(0);
  const [centers, setCenters] = useState([]);

  const fetchAppointments = useCallback(async (pageNumber = 0, size = 10) => {
    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await request(ApiEnum.APPOINTMENT, {
        Page: pageNumber,
        Size: size,
      });

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

  useEffect(() => {
    let mounted = true;
    const loadCenters = async () => {
      try {
        const res = await request(ApiEnum.ORGANIZATION, {});
        const data = Array.isArray(res) ? res : res?.data || [];

        if (!mounted) return;

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

    return () => {
      mounted = false;
    };
  }, []);

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

  useEffect(() => {
    fetchAppointments(pagination.pageNumber, pagination.pageSize);
  }, [fetchAppointments, pagination.pageNumber, pagination.pageSize]);

  const handlePageChange = (pageIndex, newPageSize) => {
    fetchAppointments(pageIndex, newPageSize ?? pagination.pageSize);
  };

  const handleRefresh = useCallback(() => {
    fetchAppointments(pagination.pageNumber, pagination.pageSize);
  }, [fetchAppointments, pagination.pageNumber, pagination.pageSize]);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    toast.success("Appointment created successfully!");
    handleRefresh();
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    if (!isRescheduling.current) {
      setSelectedAppointment(null);
    }
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedAppointment(null);
    isRescheduling.current = false;
  };

  const callAppointmentAction = async (apiEnum, payload, successMsg) => {
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

  const handleRescheduleClick = () => {
    isRescheduling.current = true;
    setShowViewModal(false);
    setIsRescheduleOpen(true);
  };

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

      {isRescheduleOpen && (
        <AppointmentRescheduleModal
          isOpen={isRescheduleOpen}
          onClose={handleCloseRescheduleModal}
          appointment={selectedAppointment}
          fetchTimeSlots={fetchTimeSlots}
          onSubmit={handleRescheduleSubmit}
        />
      )}
    </>
  );
};
