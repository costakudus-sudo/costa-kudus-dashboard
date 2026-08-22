export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId?: string;
  clientName: string;
  phone: string;
  service: string;
  amount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  createdAt: any;
}