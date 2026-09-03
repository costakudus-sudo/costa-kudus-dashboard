import { Timestamp } from "firebase/firestore";

export interface Invoice {
  id: string;

  invoiceNumber: string;

  jobId: string;

  clientId: string;

  clientName: string;

  phone: string;

  email?: string;

  service: string;

  serviceDetails?: string;

  amount: number;

  discount?: number;

  total?: number;

  amountPaid?: number;

  balance?: number;

  startDate?: string;

  endDate?: string;

  paymentStatus:
    | "Unpaid"
    | "Part Payment"
    | "Paid";

  createdAt: Timestamp;
}