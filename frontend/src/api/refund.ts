import appAxios from "@/services/AxiosClient";

export interface RefundCalculation {
  booking_id: number;
  original_amount: number;
  refund_percentage: number;
  cancellation_fee: number;
  refund_amount: number;
  hours_until_departure: number;
  policy_applied: string;
  can_cancel: boolean;
  message: string;
}

export interface RefundCreate {
  booking_id: number;
  refund_reason?: string;
  notes?: string;
}

export interface Refund {
  refund_id: number;
  booking_id: number;
  payment_id?: number;
  refund_amount: number;
  refund_percentage: number;
  cancellation_fee: number;
  refund_reason?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requested_by: string;
  processed_by?: string;
  requested_at?: string;
  processed_at?: string;
  notes?: string;
}

export interface RefundStatusUpdate {
  status: "pending" | "approved" | "rejected" | "completed";
  notes?: string;
}

export interface CancellationPolicy {
  policy_id: number;
  name: string;
  description?: string;
  hours_before_departure: number;
  refund_percentage: number;
  cancellation_fee: number;
  is_active: string;
  created_at?: string;
}

export interface CancellationPolicyCreate {
  name: string;
  description?: string;
  hours_before_departure: number;
  refund_percentage: number;
  cancellation_fee?: number;
}

// Calculate refund amount for a booking
export const calculateRefund = async (bookingId: number): Promise<RefundCalculation> => {
  const response = await appAxios.post<RefundCalculation>(`/refunds/calculate/${bookingId}`);
  if (!response.data) {
    throw new Error("Failed to calculate refund");
  }
  return response.data;
};

// Create a refund request
export const createRefundRequest = async (refundData: RefundCreate): Promise<Refund> => {
  const response = await appAxios.post<Refund>('/refunds/', refundData);
  if (!response.data) {
    throw new Error("Failed to create refund request");
  }
  return response.data;
};

// Get all refunds (admin/agent view or user's own refunds)
export const getAllRefunds = async (status?: string): Promise<Refund[]> => {
  const params = status ? { status } : {};
  const response = await appAxios.get<Refund[]>('/refunds/', { params });
  if (!response.data) {
    throw new Error("Failed to fetch refunds");
  }
  return response.data;
};

// Get user's refunds
export const getUserRefunds = async (userId: string): Promise<Refund[]> => {
  const response = await appAxios.get<Refund[]>(`/refunds/user/${userId}`);
  if (!response.data) {
    throw new Error("Failed to fetch user refunds");
  }
  return response.data;
};

// Get refunds for a specific booking
export const getBookingRefunds = async (bookingId: number): Promise<Refund[]> => {
  const response = await appAxios.get<Refund[]>(`/refunds/booking/${bookingId}`);
  if (!response.data) {
    throw new Error("Failed to fetch booking refunds");
  }
  return response.data;
};

// Get a specific refund
export const getRefund = async (refundId: number): Promise<Refund> => {
  const response = await appAxios.get<Refund>(`/refunds/${refundId}`);
  if (!response.data) {
    throw new Error("Failed to fetch refund");
  }
  return response.data;
};

// Process a refund (admin/agent only)
export const processRefund = async (
  refundId: number,
  statusUpdate: RefundStatusUpdate
): Promise<Refund> => {
  const response = await appAxios.put<Refund>(`/refunds/${refundId}/process`, statusUpdate);
  if (!response.data) {
    throw new Error("Failed to process refund");
  }
  return response.data;
};

// Get active cancellation policies
export const getActivePolicies = async (): Promise<CancellationPolicy[]> => {
  const response = await appAxios.get<CancellationPolicy[]>('/refunds/policies/active');
  if (!response.data) {
    throw new Error("Failed to fetch cancellation policies");
  }
  return response.data;
};

// Create cancellation policy (admin only)
export const createCancellationPolicy = async (
  policyData: CancellationPolicyCreate
): Promise<CancellationPolicy> => {
  const response = await appAxios.post<CancellationPolicy>('/refunds/policies', policyData);
  if (!response.data) {
    throw new Error("Failed to create cancellation policy");
  }
  return response.data;
};

// Get cancellation policy
export const getCancellationPolicy = async (policyId: number): Promise<CancellationPolicy> => {
  const response = await appAxios.get<CancellationPolicy>(`/refunds/policies/${policyId}`);
  if (!response.data) {
    throw new Error("Failed to fetch cancellation policy");
  }
  return response.data;
};
