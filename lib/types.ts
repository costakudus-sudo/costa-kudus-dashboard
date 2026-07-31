export interface Client {
  id: string;
  fullName: string;
  phone: string;
  service: string;
  serviceDetails: string;
  amount: number;
  jobStatus: "Pending" | "In Progress" | "Completed" | "Cancelled";
  paymentStatus: "Unpaid" | "Part Payment" | "Paid";
  createdAt: Date;
}