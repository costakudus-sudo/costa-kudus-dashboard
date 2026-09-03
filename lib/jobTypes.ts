import { Timestamp } from "firebase/firestore";

export type JobStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Unpaid"
  | "Part Payment"
  | "Paid";

export type PaymentMethod =
  | "Cash"
  | "Mobile Money"
  | "Bank Transfer"
  | "Card";

export type RequestStatus =
  | "New"
  | "Reviewed"
  | "Accepted"
  | "Rejected";

export interface Job {
  // Firebase document ID
  id: string;

  // Customer-friendly job number
  // Example: JOB-0001
  jobNumber?: string;

  // Alternative/legacy job ID
  jobId?: string;

  // Client information
  clientId: string;
  clientName: string;
  phone: string;
  email?: string;

  // Job information
  service: string;
  serviceDetails: string;

  // Financial information
  amount: number;
  discount?: number;
  total?: number;
  amountPaid?: number;
  balance?: number;

  // Job status
  jobStatus: JobStatus;

  // Payment information
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Timestamp;

  // Scheduling information
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;

  // Additional information
  notes?: string;
  source?: string;

  // Customer job request
  requestStatus?: RequestStatus;

  // Timestamps
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}