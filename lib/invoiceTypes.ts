export interface Invoice {
  id: string;

  invoiceNumber: string;

  jobId?: string;

  clientName: string;

  phone: string;

  service: string;

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

  createdAt: any;
}