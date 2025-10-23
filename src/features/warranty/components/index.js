// src/features/warranty/components/index.js

export { AssignTechnicianModal } from './AssignTechnicianModal';
export { CreateWarrantyClaimModal } from './CreateWarrantyClaimModal';
export { WarrantyClaimDetailModal } from './WarrantyClaimDetailModal';
export { WarrantyClaimListView } from './WarrantyClaimListView';

// New status-specific modals
export { BaseWarrantyDetailSection } from './BaseWarrantyDetailSection';
export { PendingConfirmationDetailModal } from './PendingConfirmationDetailModal';
export { ApprovedClaimModal } from './ApprovedClaimModal';
export { DeniedOrRepairedClaimModal } from './DeniedOrRepairedClaimModal';
export { CarBackHomeModal } from './CarBackHomeModal';
export { SentToManufacturerModal } from './SentToManufacturerModal';

// Keep old PendingConfirmationModal for backward compatibility (optional)
// export { PendingConfirmationModal } from './PendingConfirmationModal';
