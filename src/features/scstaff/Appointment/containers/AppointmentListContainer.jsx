import React, { useState, useEffect, useCallback, useRef } from "react";
import AppointmentList from "../components/AppointmentList";
import AppointmentCreateModal from "../components/AppointmentCreateModal";
import AppointmentViewModal from "../components/AppointmentViewModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";

// Đảm bảo bạn đang export "const" chứ không phải "default"
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

  // Fetch service centers for the create form (delegated to container)
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

  // Delegate fetching timeslots to container so modal/form can call it
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
      // refresh list after successful creation
      await fetchAppointments(pagination.pageNumber, pagination.pageSize);
      return res;
    } catch (err) {
      console.error("Create appointment failed:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAppointments(pagination.pageNumber, pagination.pageSize);
  }, [fetchAppointments, pagination.pageNumber, pagination.pageSize]);

  const handlePageChange = (pageIndex, newPageSize) => {
    // If DataTable is 0-based, pass pageIndex directly to API (consistent with Campaign)
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
        onClose={() => {
          setShowViewModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />

      <AppointmentCreateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        centers={centers}
        fetchTimeSlots={fetchTimeSlots}
        createAppointment={createAppointment}
      />
    </>
  );
};
