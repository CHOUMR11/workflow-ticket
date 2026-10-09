import { User, Priority } from './task.model';
import { Partner } from './partner.model';

export interface InvoiceInfo {
  externalId?: string | null;
  reference?: string;
  amount?: number | null;
  dueDate?: string | null;
  status?: 'unpaid' | 'partial' | 'paid' | null;
}

export interface DevisInfo {
  externalId?: string | null;
  reference?: string;
  amount?: number | null;
  date?: string | null;
}

export interface Ticket {
  _id: string;
  ticketRef?: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: Priority;
  requester: User;
  assignee?: User | null;
  relatedTask?: string | null;
  createdAt: string;
  progress?: number;
  partner?: Partner | null;
  devis?: DevisInfo;
  saleInvoice?: InvoiceInfo;
  purchaseInvoice?: InvoiceInfo;
  commentCount?: number;
  attachmentCount?: number;
  updatedAt?: string;
}
