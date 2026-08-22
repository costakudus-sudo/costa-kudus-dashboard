export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  service: string;
  serviceDetails: string;
  amount: number;
  jobStatus: "Pending" | "In Progress" | "Completed" | "Cancelled";
  paymentStatus: "Unpaid" | "Part Payment" | "Paid";
  scheduledDate?: string;
  createdAt: Date;
}