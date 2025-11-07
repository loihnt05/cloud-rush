import appAxios from "@/services/AxiosClient";
import type { Payment, PaymentCreate } from "@/types/payment";

// Payment APIs
export const createPayment = async (payment: PaymentCreate): Promise<Payment> => {
  const response = await appAxios.post<Payment>('/payments/', payment);
  if (!response.data) {
    throw new Error("Failed to create payment");
  }
  return response.data;
};

export const getPaymentByBooking = async (bookingId: number): Promise<Payment> => {
  const response = await appAxios.get<Payment>(`/payments/booking/${bookingId}`);
  if (!response.data) {
    throw new Error("Failed to fetch payment");
  }
  return response.data;
};

export const updatePaymentStatus = async (paymentId: number, status: string): Promise<Payment> => {
  const response = await appAxios.put<Payment>(`/payments/${paymentId}/status?status=${status}`);
  if (!response.data) {
    throw new Error("Failed to update payment status");
  }
  return response.data;
};
