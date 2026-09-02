export interface Job {
  id: string;

  clientId: string;

  clientName: string;

  phone: string;

  service: string;

  serviceDetails: string;

  amount: number;

  discount?: number;

  total?: number;

  amountPaid?: number;

  balance?: number;

jobStatus:
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Delivered"
  | "Cancelled";

  paymentStatus:
    | "Unpaid"
    | "Part Payment"
    | "Paid";

  startDate?: string;

  endDate?: string;

  createdAt: Date;
}