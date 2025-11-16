import React, { useState, useEffect, useCallback, useRef } from "react";
import PolicyList from "../components/PolicyList";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import ViewPolicyModal from "../components/ViewPolicyModal";
import CreatePolicyModal from "../components/CreatePolicyModal";
import EditPolicyModal from "../components/EditPolicyModal";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";

const PolicyContainer = () => {
  // Component này là "container" cho trang quản lý Policy (WarrantyPolicy).
  // - Lấy danh sách policy từ API, normalize về 1 shape nhất quán để render trong `PolicyList`.
  // - Quản lý trạng thái modal View / Create / Edit / Delete.
  // - Cung cấp các handler: tạo, sửa, xóa policy (gọi API), kèm xử lý lỗi và toast thông báo.
  // - Sử dụng `latestRequestRef` để tránh race khi nhiều request song song.

  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  const [clientPagination, setClientPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
  });

  /** Modal states */
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPolicy, setSelectedPolicy] = useState(null);

  /** Filtering states */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const latestRequestRef = useRef(0);

  //OPEN CREATE MODAL
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  // OPEN VIEW MODAL
  const handleViewPolicy = (policy) => {
    // Accept either a normalized item or a row from PolicyList (which may have `raw`)
    const raw = policy?.__raw ?? policy?.raw ?? policy?._raw ?? policy;
    // Chuẩn hoá object trước khi set vào state để modal luôn nhận kiểu dữ liệu mong đợi
    // (modal sử dụng `policy.policyName`, `policy.policyId`,...)
    setSelectedPolicy(normalizePolicy(raw));
    setShowViewModal(true);
  };

  // OPEN EDIT MODAL
  const handleEditPolicy = (policy) => {
    const raw = policy?.__raw ?? policy?.raw ?? policy?._raw ?? policy;
    setSelectedPolicy(normalizePolicy(raw));
    setShowEditModal(true);
  };

  // OPEN DELETE CONFIRM
  const handleDeletePolicy = (policy) => {
    const raw = policy?.__raw ?? policy?.raw ?? policy?._raw ?? policy;
    setSelectedPolicy(normalizePolicy(raw));
    setShowDeleteModal(true);
  };

  // Normalize a raw API item or already-normalized object into the shape
  // expected by the modal components (policyName, policyId, coveragePeriodMonths, conditions, status)
  const normalizePolicy = (p) => {
    // Hàm này đảm bảo mọi API response khác nhau (có thể dùng 'name' hoặc 'policyName')
    // được chuyển thành 1 object có các trường cố định mà view/edit/delete modal mong đợi.
    // Lý do cần normalize:
    // - Bảng (PolicyList) có thể map tên bằng cách dùng `policyName` nhưng API trả về `name`.
    // - Khi truyền thẳng object thô vào modal thì modal đọc `policy.policyName` sẽ bị undefined.
    // - Normalize giúp tránh việc phải sửa nhiều chỗ hiển thị.

    if (!p) return null;
    return {
      policyId: p.policyId ?? p.id ?? p.policy_id ?? "",
      policyName: p.policyName ?? p.name ?? "-",
      conditions: p.conditions ?? "-",
      coveragePeriodMonths:
        p.coveragePeriodMonths ?? p.coverage_months ?? p.coveragePeriod ?? "-",
      status:
        p.status ??
        (typeof p.active === "boolean"
          ? p.active
            ? "Active"
            : "Inactive"
          : "Unknown"),
      active: typeof p.active === "boolean" ? p.active : true,
      __raw: p,
    };
  };

  // ----------------------------------------------------------------------
  // 🔹 FETCH POLICY LIST
  // ----------------------------------------------------------------------
  // Gọi API lấy danh sách policy. Có 2 điểm lưu ý:
  // - Sử dụng `requestId` (latestRequestRef) để tránh race: nếu người dùng thay đổi trang
  //   hoặc làm 1 request mới trước khi request cũ trả về, request cũ sẽ bị bỏ qua.
  // - Chuẩn hoá dữ liệu thành `normalized` để trình bày và filter ở client dễ dàng.
  const fetchPolicies = useCallback(async (pageNumber = 0, size = 10) => {
    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await request(ApiEnum.POLICY_MANAGEMENT, {
        Page: pageNumber,
        Size: size,
      });

      if (requestId !== latestRequestRef.current) return;

      const items = Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      const normalized = items.map((p) => ({
        policyName: p.policyName ?? p.name ?? "-",
        conditions: p.conditions ?? "-",
        coveragePeriodMonths: p.coveragePeriodMonths ?? "-",
        status:
          p.status ??
          (typeof p.active === "boolean"
            ? p.active
              ? "Active"
              : "Inactive"
            : "Active"),
        active: typeof p.active === "boolean" ? p.active : true,
        __raw: p,
      }));

      setPolicies(normalized);
      setFilteredPolicies(normalized);

      setPagination({
        pageNumber: res.data?.pageNumber ?? 0,
        pageSize: res.data?.pageSize ?? 10,
        totalRecords: res.data?.totalRecords ?? items.length,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load warranty policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies(pagination.pageNumber, pagination.pageSize);
  }, [fetchPolicies, pagination.pageNumber, pagination.pageSize]);

  // ----------------------------------------------------------------------
  // 🔹 CLIENT-SIDE FILTERING
  // ----------------------------------------------------------------------
  useEffect(() => {
    let result = [...policies];

    if (searchQuery)
      result = result.filter((p) =>
        p.policyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedStatus)
      result = result.filter(
        (p) =>
          p.status?.toLowerCase() === selectedStatus.toLowerCase() ||
          p.active?.toString() === selectedStatus.toLowerCase()
      );

    setFilteredPolicies(result);
    setClientPagination((prev) => ({ ...prev, pageNumber: 0 }));
  }, [policies, searchQuery, selectedStatus]);

  const filtersActive = searchQuery || selectedStatus;

  // ----------------------------------------------------------------------
  // 🔹 PAGE CHANGE
  // ----------------------------------------------------------------------
  const handlePageChange = (pageIndex, newPageSize) => {
    if (filtersActive) {
      setClientPagination({ pageNumber: pageIndex, pageSize: newPageSize });
    } else {
      fetchPolicies(pageIndex, newPageSize);
    }
  };

  // ----------------------------------------------------------------------
  // 🔹 REFRESH
  // ----------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    fetchPolicies(pagination.pageNumber, pagination.pageSize);
    toast.info("Data refreshed");
  }, [fetchPolicies, pagination.pageNumber, pagination.pageSize]);

  // ----------------------------------------------------------------------
  // 🔹 CREATE POLICY
  // ----------------------------------------------------------------------

  // Chi tiết luồng Tạo Policy:
  // - Hàm `handleCreatePolicy` chấp nhận payload từ modal hoặc caller. Payload
  //   có thể là envelope `{ request: { ... } }` hoặc object top-level.
  // - Hàm sẽ normalize dữ liệu (lấy `name`, `conditions`, `coveragePeriodMonths`, `orgId`).
  // - Kiểm tra client-side bắt buộc: `name` và `conditions` phải có.
  // - Gửi request tới API dưới dạng top-level body với `policyId: null` (tránh gửi
  //   chuỗi rỗng cho GUID vì sẽ gây lỗi conversion ở backend).
  // - Nếu có lỗi từ server, sẽ lấy `responseData.errors` để hiển thị toast chi tiết.

  const handleCreatePolicy = useCallback(
    async (payload) => {
      // Normalize incoming payload: support both top-level and `{ request: { ... } }` envelopes
      const data = payload?.request ? payload.request : payload || {};

      const name = String(data.name ?? data.policyName ?? "").trim();
      const conditions = String(data.conditions ?? "").trim();
      const coveragePeriodMonths = Number(
        data.coveragePeriodMonths ?? data.coveragePeriod ?? 0
      );
      const orgId = data.orgId ?? null;

      // Client-side required validation
      if (!name) {
        toast.error("Policy Name is required");
        return;
      }
      if (!conditions) {
        toast.error("Conditions is required");
        return;
      }

      setLoading(true);
      setError(null);

      const requestId = ++latestRequestRef.current;

      // Send top-level payload (use null for nullable GUIDs to avoid empty-string GUID errors)
      const finalPayload = {
        policyId: null,
        name,
        coveragePeriodMonths: Number.isFinite(coveragePeriodMonths)
          ? coveragePeriodMonths
          : 0,
        orgId: orgId === "" ? null : orgId,
        status: data.status ?? null,
        conditions,
      };

      try {
        await request(ApiEnum.CREATE_POLICY, finalPayload);

        if (requestId !== latestRequestRef.current) return;

        toast.success("Policy created successfully!");
        setShowCreateModal(false);
        fetchPolicies();
      } catch (err) {
        console.error("Create policy failed:", err);
        const serverData = err?.responseData || err?.response || err;
        // Prefer detailed validation messages when available
        const serverMessage =
          (serverData &&
            (serverData.message ||
              serverData.error ||
              (serverData.errors &&
                Object.values(serverData.errors).flat().join(", ")))) ||
          "Failed to create policy.";
        setError(serverMessage);
        toast.error(serverMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchPolicies]
  );
  // ----------------------------------------------------------------------
  // 🔹 UPDATE POLICY
  // ----------------------------------------------------------------------
  // Ghi chú về Update:
  // - `handleUpdatePolicy` sử dụng `selectedPolicy.policyId` làm id để gọi API.
  // - Modal Edit có thể trả về trường `policyName`, vì vậy ta map sang `name`
  //   khi gửi lên backend: `name: payload.policyName ?? payload.name`.
  // - Sau khi update thành công, ta đóng modal và reload danh sách.
  // - Có kiểm tra `requestId` để tránh cập nhật state không mong muốn khi request cũ trả về sau.

  const handleUpdatePolicy = useCallback(
    async (payload) => {
      if (!selectedPolicy?.policyId) return;

      const requestId = ++latestRequestRef.current;
      setLoading(true);
      setError(null);

      try {
        // Prepare normalized body values (support payload from modal or envelope)
        const bodyData = payload?.request ? payload.request : payload || {};
        const nameVal = String(
          bodyData.name ??
            bodyData.policyName ??
            selectedPolicy.policyName ??
            ""
        ).trim();
        const conditionsVal = String(
          bodyData.conditions ?? selectedPolicy.conditions ?? ""
        ).trim();
        const coverageVal = Number(
          bodyData.coveragePeriodMonths ??
            bodyData.coveragePeriod ??
            selectedPolicy.coveragePeriodMonths ??
            0
        );
        // Ensure we always send a status value (server requires it on update)
        const statusVal =
          bodyData.status ??
          bodyData.Status ??
          selectedPolicy?.status ??
          "Active";

        // Validate required fields client-side to avoid needless requests
        if (!nameVal || !conditionsVal) {
          toast.error("Name and Conditions are required to update policy.");
          setLoading(false);
          return;
        }

        // Send a single top-level PascalCase payload (server expects PascalCase fields)
        // This avoids making multiple sequential requests which can produce
        // an initial 400 error followed by a successful fallback — confusing UX.
        const topLevelPascal = {
          params: { id: selectedPolicy.policyId },
          PolicyId: selectedPolicy.policyId,
          Name: nameVal,
          CoveragePeriodMonths: Number.isFinite(coverageVal) ? coverageVal : 0,
          Conditions: conditionsVal,
          Status: statusVal,
        };

        await request(ApiEnum.UPDATE_POLICY, topLevelPascal);

        if (requestId !== latestRequestRef.current) return;

        toast.success("Policy updated successfully!");
        setShowEditModal(false);
        fetchPolicies();
      } catch (err) {
        console.error(err);
        setError("Failed to update policy.");
        toast.error("Update failed");
      } finally {
        setLoading(false);
      }
    },
    [fetchPolicies, selectedPolicy]
  );

  // ----------------------------------------------------------------------
  // 🔹 DELETE POLICY
  // ----------------------------------------------------------------------
  // - `handleConfirmDelete` dùng `selectedPolicy.policyId` để build URL (params.id).
  // - Nếu server trả lỗi (500/400), chúng ta log chi tiết và cố lấy message từ
  //   `err.responseData` để hiển thị cho người dùng (toast + setError).
  // - Vì có thể có ràng buộc (FK) hoặc lỗi business phía server, message chi tiết
  //   sẽ giúp debug (xem traceId trên server logs).

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPolicy?.policyId) return;

    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      await request(ApiEnum.DELETE_POLICY, {
        params: { id: selectedPolicy.policyId }, // tự động replace :id
      });

      if (requestId !== latestRequestRef.current) return;

      toast.success("Policy deleted successfully!");
      // Close confirm dialog and any open edit modal, clear selection
      setShowDeleteModal(false);
      setShowEditModal(false);
      setSelectedPolicy(null);
      fetchPolicies(); // reload danh sách
    } catch (err) {
      // Try to surface any server-provided error message to the user
      console.error("Delete policy error:", err);
      // `request` helper may attach the server response under `responseData` or `response`
      const serverData = err?.responseData || err?.response || err;
      const serverMessage =
        (serverData &&
          (serverData.message || serverData.error || serverData.detail)) ||
        (typeof serverData === "string" ? serverData : null);

      setError(serverMessage || "Failed to delete policy.");
      if (serverMessage) {
        toast.error(`Delete failed: ${serverMessage}`);
      } else {
        toast.error("Delete failed!");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPolicy, fetchPolicies]);

  // ----------------------------------------------------------------------
  // 🔹 RENDER
  // ----------------------------------------------------------------------
  return (
    <div style={{ marginTop: 40 }}>
      <PolicyList
        data={filtersActive ? filteredPolicies : policies}
        loading={loading}
        error={error}
        pagination={
          filtersActive
            ? {
                pageNumber: clientPagination.pageNumber,
                pageSize: clientPagination.pageSize,
                totalRecords: filteredPolicies.length,
              }
            : pagination
        }
        serverSide={!filtersActive}
        onPageChange={handlePageChange}
        onSearch={setSearchQuery}
        onFilterStatus={setSelectedStatus}
        onRefresh={handleRefresh}
        refreshing={loading}
        onViewPolicy={handleViewPolicy}
        onEditPolicy={handleEditPolicy}
        onDeletePolicy={handleDeletePolicy}
        onCreatePolicy={openCreateModal}
      />

      {/* VIEW */}
      <ViewPolicyModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        policy={selectedPolicy}
      />

      <CreatePolicyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePolicy}
      />

      <EditPolicyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        policy={selectedPolicy}
        onUpdate={handleUpdatePolicy}
        onDelete={() => setShowDeleteModal(true)}
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Policy"
        message="Are you sure you want to delete this policy?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default PolicyContainer;
