import React, { useState, useEffect, useCallback, useRef } from "react";
import AccountList from "../components/AccountList";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { toast } from "react-toastify";
import ViewAccountModal from "../components/ViewAccountModal";
import CreateAccountModal from "../components/CreateAccountModal";
import EditAccountModal from "../components/EditAccountModal";
import DeleteAccountModal from "../components/DeleteAccountModal";

const AccountContainer = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Client-side pagination state
  const [clientPagination, setClientPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // Giữ lại nếu bạn muốn filter theo Role

  const [organizations, setOrganizations] = useState([]); // State cho Organization
  const latestRequestRef = useRef(0);

  // --- SỬA LỖI 3 & 4: Dùng useCallback và xóa 'status' ---
  const normalizeAccount = useCallback(
    (p) => {
      if (!p) return null;
      return {
        userId: p.userId,
        email: p.email,
        role: p.role,
        orgId: p.orgId,
        // Tìm 'name' từ state 'organizations'
        organizationName:
          organizations.find((org) => org.orgId === p.orgId)?.name || p.orgId,
        // status: p.status || "Active", // <-- ĐÃ XÓA
        __raw: p, // Giữ data gốc
      };
    },
    [organizations] // Thêm dependency
  );

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleViewAccount = (account) => {
    const raw = account?.__raw ?? account?.raw ?? account?._raw ?? account;
    setSelectedAccount(normalizeAccount(raw));
    setShowViewModal(true);
  };

  const handleEditAccount = (account) => {
    const raw = account?.__raw ?? account?.raw ?? account?._raw ?? account;
    setSelectedAccount(normalizeAccount(raw));
    setShowEditModal(true);
  };

  const handleDeleteAccount = (account) => {
    const raw = account?.__raw ?? account?.raw ?? account?._raw ?? account;
    setSelectedAccount(normalizeAccount(raw));
    setShowDeleteModal(true);
  };

  // --- Lấy danh sách tài khoản (Client-side) ---
  const fetchAccounts = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      // API này bạn đổi tên, tôi giữ nguyên
      const res = await request(ApiEnum.ACCOUNT_MANAGEMENT, {});

      if (requestId !== latestRequestRef.current) return;

      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setAccounts(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy danh sách Organizations ---
  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await request(ApiEnum.ORGANIZATION);
      const orgData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setOrganizations(orgData);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      toast.error("Failed to load organizations.");
    }
  }, []);

  useEffect(() => {
    // Gọi cả hai API khi component mount
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrganizations(), // Lấy Org trước
        fetchAccounts(), // Lấy Account sau
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchAccounts, fetchOrganizations]); // Chỉ gọi 1 lần

  // --- Lọc Client-side (Sau khi cả 2 API đã chạy) ---
  useEffect(() => {
    // Chuẩn hóa dữ liệu ở đây khi 'organizations' đã được cập nhật
    let normalized = accounts.map((acc) => normalizeAccount(acc));

    if (searchQuery)
      normalized = normalized.filter(
        (p) =>
          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedStatus)
      // Dùng selectedStatus để lọc Role
      normalized = normalized.filter(
        (p) => p.role?.toLowerCase() === selectedStatus.toLowerCase()
      );

    setFilteredAccounts(normalized);
    setClientPagination((prev) => ({ ...prev, pageNumber: 0 }));
  }, [
    accounts,
    organizations,
    searchQuery,
    selectedStatus,
    normalizeAccount, // <-- SỬA LỖI 4: Thêm dependency
  ]);

  // --- Xử lý phân trang Client-side ---
  const handlePageChange = (pageIndex, newPageSize) => {
    setClientPagination({ pageNumber: pageIndex, pageSize: newPageSize });
  };

  const handleRefresh = useCallback(() => {
    fetchAccounts();
    fetchOrganizations();
    toast.info("Data refreshed");
  }, [fetchAccounts, fetchOrganizations]);

  // --- API: Tạo Account ---
  const handleCreateAccount = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        // payload đã khớp API createAccount
        await request(ApiEnum.CREATE_ACCOUNT, payload);
        toast.success("Account created successfully!");
        setShowCreateModal(false);
        fetchAccounts(); // Tải lại danh sách
      } catch (err) {
        console.error("Create account failed:", err);
        const serverMessage =
          err.responseData?.message || "Failed to create account.";
        setError(serverMessage);
        toast.error(serverMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts]
  );

  // --- API: Cập nhật Account ---
  const handleUpdateAccount = useCallback(
    async (payload) => {
      // <-- 'payload' là data mới từ form
      if (!selectedAccount?.userId) return;

      setLoading(true);
      setError(null);
      try {
        // --- SỬA LỖI 1 & 2: Xây dựng payload đúng ---
        const finalPayload = {
          userId: selectedAccount.userId,
          Email: payload.email, // Lấy 'email' mới từ 'payload'
          PasswordHash: selectedAccount.__raw?.passwordHash || "", // Giữ hash cũ
          Role: payload.role, // Lấy 'role' mới từ 'payload'
          orgId: payload.orgId, // Lấy 'orgId' mới từ 'payload'
        };
        // ----------------------------------------

        await request(ApiEnum.UPDATE_ACCOUNT, {
          params: { id: selectedAccount.userId },
          data: finalPayload, // <-- SỬA LỖI 1: Gửi 'finalPayload' đi
        });

        toast.success("Account updated successfully!");
        setShowEditModal(false);
        fetchAccounts();
      } catch (err) {
        console.error("Update account failed:", err);
        toast.error(err.responseData?.message || "Update failed");
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts, selectedAccount] // Cần 'selectedAccount' để lấy userId và __raw
  );

  // --- API: Xóa Account ---
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedAccount?.userId) return;
    setLoading(true);
    setError(null);
    try {
      await request(ApiEnum.DELETE_ACCOUNT, {
        params: { id: selectedAccount.userId },
      });

      toast.success("Account deleted successfully!");
      setShowDeleteModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (err) {
      console.error("Delete account error:", err);
      const serverMessage =
        err.responseData?.message || "Failed to delete account.";
      setError(serverMessage);
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, fetchAccounts]);

  return (
    <div style={{ marginTop: 40, padding: "20px" }}>
      <AccountList
        data={filteredAccounts} // Hiển thị data đã lọc
        loading={loading}
        error={error}
        // Phân trang Client-side
        pagination={{
          pageNumber: clientPagination.pageNumber,
          pageSize: clientPagination.pageSize,
          totalRecords: filteredAccounts.length, // Tổng số là số dòng đã lọc
        }}
        serverSide={false} // TẮT server-side
        onPageChange={handlePageChange}
        onSearch={setSearchQuery} // Hàm search
        onFilterStatus={setSelectedStatus} // Hàm filter (dùng cho Role)
        onRefresh={handleRefresh}
        refreshing={loading}
        onViewAccount={handleViewAccount}
        onEditAccount={handleEditAccount}
        onDeleteAccount={handleDeleteAccount}
        onCreateAccount={openCreateModal}
      />

      <ViewAccountModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        account={selectedAccount}
      />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAccount}
        organizations={organizations} // Truyền Org list
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        account={selectedAccount}
        onUpdate={handleUpdateAccount}
        organizations={organizations} // Truyền Org list
        onDelete={handleDeleteAccount} // <-- Sửa: nên truyền hàm vào đây
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        account={selectedAccount}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default AccountContainer;
