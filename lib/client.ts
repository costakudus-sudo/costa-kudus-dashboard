export interface Client {
  id: string;

  fullName: string;
  phone: string;
  email: string;
  address: string;

  service: string;
  serviceDetails: string;

  amount: number;
  discount: number;
  total: number;

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

  amountPaid: number;
  balance: number;

  createdAt: string;
  updatedAt: string;
}