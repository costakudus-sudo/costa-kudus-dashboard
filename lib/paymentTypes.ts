export interface Payment {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  phone: string;
  service: string;
  jobAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: "Unpaid" | "Part Payment" | "Paid";
  paymentMethod: "Cash" | "Mobile Money" | "Bank Transfer" | "Card";
  paymentDate: Date;
  notes: string;
  createdAt: Date;
}