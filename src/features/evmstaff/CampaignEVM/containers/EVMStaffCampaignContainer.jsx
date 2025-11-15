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
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
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
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // ===== FETCH LIST =====
  const fetchCampaign = useCallback(async (pageNumber = 0, size) => {
    const effectiveSize =
      typeof size === "number" && size > 0
        ? size
        : paginationRef.current.pageSize;
    const effectivePage =
      typeof pageNumber === "number" && pageNumber >= 0
        ? pageNumber
        : paginationRef.current.pageNumber;

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    // Bật trạng thái loading, reset lỗi trước khi gọi API
    setLoading(true);
    setError(null);
    try {
      const response = await request(ApiEnum.CAMPAIGN_SCSTAFF, {
        Page: effectivePage,
        Size: effectiveSize,
      });

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
        setFilteredCampaigns([]);
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
        setFilteredCampaigns([]);
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

  useEffect(() => {
    fetchCampaign(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize
    );
  }, [fetchCampaign]);

  // ===== GIẢI THÍCH FILTERS =====
  // Các effect và handlers phía dưới xử lý search + filter client-side.
  // Khi người dùng nhập search hoặc chọn filter, chúng ta lọc trên mảng `campaigns`
  // đã tải về (client-side). Nếu có filter active, UI sẽ dùng `clientPagination`
  // để phân trang local, ngược lại dùng pagination server.

  // ===== SEARCH + FILTER =====
  useEffect(() => {
    let result = [...campaigns];

    // search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }

    // filter by type
    if (selectedType) {
      result = result.filter((c) => c.type === selectedType);
    }

    // filter by status
    if (selectedStatus) {
      result = result.filter((c) => c.status === selectedStatus);
    }

    setFilteredCampaigns(result);
  }, [campaigns, searchQuery, selectedType, selectedStatus]);

  // Khi thay đổi bộ lọc (search/type/status) reset page client về 0

  useEffect(() => {
    setClientPagination((prev) => ({ ...prev, pageNumber: 0 }));
  }, [searchQuery, selectedType, selectedStatus]);

  const filtersActive =
    Boolean(searchQuery) || Boolean(selectedType) || Boolean(selectedStatus);

  const handleSearch = useCallback((query) => setSearchQuery(query || ""), []);
  const handleTypeFilter = useCallback(
    (type) => setSelectedType(type || ""),
    []
  );
  const handleStatusFilter = useCallback(
    (status) => setSelectedStatus(status || ""),
    []
  );

  // NOTE: handlers phía trên được memoized bằng useCallback để tránh
  // tạo lại hàm khi component re-render, giúp truyền xuống component con
  // mà không gây re-render không cần thiết.

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
        paginationRef.current.pageSize
      );
    } catch (e) {
      console.error("❌ Lỗi khi tạo campaign:", e);
    } finally {
      setShowAddModal(false);
    }
  };

  // ===== PAGINATION =====
  const derivedPagination = useMemo(
    () =>
      filtersActive
        ? {
            pageNumber: clientPagination.pageNumber,
            pageSize: clientPagination.pageSize,
            totalRecords: filteredCampaigns.length,
          }
        : pagination,
    [filtersActive, clientPagination, pagination, filteredCampaigns.length]
  );

  const handlePageChange = useCallback(
    (pageIndex, newPageSize) => {
      if (filtersActive) {
        setClientPagination((prev) => ({
          pageNumber: Math.max(
            0,
            typeof pageIndex === "number" ? pageIndex : prev.pageNumber
          ),
          pageSize: newPageSize || prev.pageSize,
        }));
      } else {
        fetchCampaign(pageIndex, newPageSize || paginationRef.current.pageSize);
      }
    },
    [filtersActive, fetchCampaign]
  );

  const handleRefresh = useCallback(() => {
    fetchCampaign(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize
    );
  }, [fetchCampaign]);

  // ===== RENDER =====
  return (
    <div style={{ marginTop: 40 }}>
      <Campaign
        data={filtersActive ? filteredCampaigns : campaigns}
        loading={loading}
        error={error}
        pagination={derivedPagination}
        serverSide={!filtersActive}
        onView={handleViewCampaign}
        onAdd={handleAddCampaign}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterType={handleTypeFilter}
        onFilterStatus={handleStatusFilter}
        onRefresh={handleRefresh}
        refreshing={loading}
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
