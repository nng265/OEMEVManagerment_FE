import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Campaign from "../components/Campaign";
import { ViewCampaignModal } from "../components/ViewCampaignModal";
import { AddCampaignModal } from "../components/AddCampaignModal";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";

/*

  - Trách nhiệm chính:
    * Gọi API lấy danh sách campaign (có phân trang)
    * Chuẩn hoá dữ liệu trả về (normalize)
    * Quản lý trạng thái filter/search client-side
    * Mở/đóng modal xem và tạo campaign
    * Cung cấp hàm tạo campaign và refresh sau khi tạo

  Ghi chú kỹ thuật:
  - Sử dụng `latestRequestRef` để tránh race condition khi gọi API nhiều lần.
  - `paginationRef` dùng để tham chiếu đến pagination hiện tại bên trong callback
    mà không phải đưa `pagination` vào dependency array của useCallback.
*/

// ================== CONTAINER ==================
export const EVMStaffCampaignContainer = () => {
  // --- STATE ---
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalRecords: 0,
  });

  const paginationRef = useRef(pagination);
  const latestRequestRef = useRef(0);
  
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // =====================================================
  // Explanation of the refs above:
  // - paginationRef: cho phép truy cập giá trị pagination mới nhất bên trong
  //   các hàm callback mà không cần kê pagination vào dependency array.
  // - latestRequestRef: giữ id (số tăng dần) của request gần nhất để kiểm tra
  //   khi response về có phải response mới nhất hay không (tránh overwrite state
  //   bằng response cũ khi user thao tác nhanh).
  // =====================================================

  // --- MODAL STATES ---
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const searchRef = useRef("");
  const typeRef = useRef("");
  const statusRef = useRef("");

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
  }, [debouncedSearchQuery]);

  useEffect(() => {
    typeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    statusRef.current = selectedStatus;
  }, [selectedStatus]);

  // Debounce search query để tránh request liên tục
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay 500ms sau khi user ngừng gõ

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ===== FETCH LIST =====
  const fetchCampaign = useCallback(async (pageNumber = 0, size, search, type, status) => {
    const effectiveSize =
      typeof size === "number" && size > 0
        ? size
        : paginationRef.current.pageSize;
    const effectivePage =
      typeof pageNumber === "number" && pageNumber >= 0
        ? pageNumber
        : paginationRef.current.pageNumber;
    const effectiveSearch =
      typeof search === "string" ? search : searchRef.current;
    const effectiveType =
      typeof type === "string" ? type : typeRef.current;
    const effectiveStatus =
      typeof status === "string" ? status : statusRef.current;

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    // Bật trạng thái loading, reset lỗi trước khi gọi API
    setLoading(true);
    setError(null);
    try {
      const params = {
        Page: effectivePage,
        Size: effectiveSize,
      };

      // Thêm search query nếu có
      if (effectiveSearch && effectiveSearch.trim()) {
        params.Search = effectiveSearch.trim();
      }

      // Thêm type filter nếu có
      if (effectiveType && effectiveType.trim()) {
        params.Type = effectiveType.trim();
      }

      // Thêm status filter nếu có
      if (effectiveStatus && effectiveStatus.trim()) {
        params.Status = effectiveStatus.trim();
      }

      const response = await request(ApiEnum.CAMPAIGN_SCSTAFF, params);

      // Chuẩn hoá kết quả phân trang bằng hàm helper (trả về cấu trúc chuẩn)
      const {
        success,
        items: rawItems,
        totalRecords,
        page,
        size: pageSize,
        message,
      } = normalizePagedResult(response, []);

      if (requestId !== latestRequestRef.current) {
        return;
      }

      if (success) {
        // Map / normalize từng item về cấu trúc mà UI cần
        const normalized = rawItems.map((it, index) => ({
          // Hiện tại dùng các trường mô tả cho UI, giữ payload gốc trong _raw
          description: it.description || "",
          title: it.title ?? it.titleId ?? "",
          type: it.type ?? "",
          target: it.partModel || "",
          startDate: it.startDate,
          endDate: it.endDate,
          period:
            it.period ||
            (it.startDate && it.endDate
              ? `${it.startDate} to ${it.endDate}`
              : undefined),
          status: it.status ?? "",
          _raw: it,
          totalAffectedVehicles: it.totalAffectedVehicles || 0,
          pendingVehicles: it.pendingVehicles || 0,
          inProgressVehicles: it.inProgressVehicles || 0,
          completedVehicles: it.completedVehicles || 0,
        }));

        // Cập nhật state với dữ liệu đã normalize
        setCampaigns(normalized);
        setFilteredCampaigns(normalized);
        // Cập nhật pagination dựa trên kết quả normalize
        setPagination({
          pageNumber:
            typeof page === "number" && page >= 0 ? page : effectivePage,
          pageSize:
            typeof pageSize === "number" && pageSize > 0
              ? pageSize
              : effectiveSize,
          totalRecords:
            typeof totalRecords === "number" ? totalRecords : normalized.length,
        });
      } else {
        // Nếu API trả success=false, reset danh sách và show lỗi
        setCampaigns([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: effectivePage,
          pageSize: effectiveSize,
          totalRecords: 0,
        }));
        setError(message || "Unable to load campaign.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi load campaigns:", err);
      // Nếu đây là response mới nhất thì cập nhật trạng thái lỗi
      if (requestId === latestRequestRef.current) {
        const message =
          err?.responseData?.message ||
          err?.message ||
          "Unable to load campaigns.";
        // Reset dữ liệu hiển thị
        setCampaigns([]);
        setPagination((prev) => ({
          ...prev,
          pageNumber: effectivePage,
          pageSize: effectiveSize,
          totalRecords: 0,
        }));
        // Set thông báo lỗi để UI show
        setError(message);
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch khi filters thay đổi
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    fetchCampaign(0, paginationRef.current.pageSize, debouncedSearchQuery, selectedType, selectedStatus);
  }, [fetchCampaign, debouncedSearchQuery, selectedType, selectedStatus]);

  // ===== HANDLERS =====
  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value || "";
    setSelectedType(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value || "";
    setSelectedStatus(value);
  };

  // ===== ADD + VIEW =====
  const handleViewCampaign = (campaign) => {
    console.log(" Viewing campaign:", campaign);
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleAddCampaign = () => setShowAddModal(true);

  const handleAddSubmit = async (newCampaign) => {
    try {
      const payload = {
        type: newCampaign?.type ?? "",
        title: newCampaign?.title ?? "",
        description: newCampaign?.description ?? "",
        partModel: newCampaign?.partModel ?? null,
        replacementPartModel: newCampaign?.replacementPartModel ?? null,
        startDate: newCampaign?.startDate ?? "",
        endDate: newCampaign?.endDate ?? "",
      };

      console.log(" Sending payload:", payload);

      // Gọi API tạo campaign. Sau khi thành công, gọi lại fetchCampaign
      // để refresh danh sách (dùng paginationRef hiện tại)
      const res = await request(ApiEnum.CREATE_COMPAIGN, payload);
      console.log("API Response:", res);

      await fetchCampaign(
        paginationRef.current.pageNumber,
        paginationRef.current.pageSize,
        searchRef.current,
        typeRef.current,
        statusRef.current
      );
    } catch (e) {
      console.error("❌ Lỗi khi tạo campaign:", e);
    } finally {
      setShowAddModal(false);
    }
  };

  // ===== PAGINATION =====
  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      fetchCampaign(
        pageIndex,
        newPageSize || paginationRef.current.pageSize,
        searchRef.current,
        typeRef.current,
        statusRef.current
      );
    },
    [fetchCampaign]
  );

  const handleRefresh = useCallback(() => {
    fetchCampaign(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      typeRef.current,
      statusRef.current
    );
  }, [fetchCampaign]);

  // ===== RENDER =====
  return (
    <div style={{ marginTop: 40 }}>
      <Campaign
        data={campaigns}
        loading={loading}
        error={error}
        pagination={pagination}
        serverSide={true}
        onView={handleViewCampaign}
        onAdd={handleAddCampaign}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        typeFilter={selectedType}
        onTypeFilterChange={handleTypeFilterChange}
        statusFilter={selectedStatus}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <ViewCampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        campaign={selectedCampaign}
      />

      <AddCampaignModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default EVMStaffCampaignContainer;
