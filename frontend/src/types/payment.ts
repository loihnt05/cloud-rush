// Payment types
export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number | string;
  payment_date?: string;
  method?: string;
  status: string;
}

export interface PaymentCreate {
  booking_id: number;
  amount: number | string;
  method?: string;
  status?: string;
}

export interface PaymentUpdate {
  status?: string;
}
