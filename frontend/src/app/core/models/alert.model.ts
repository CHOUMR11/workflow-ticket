export interface PaymentAlert {
  ticketId: string;
  ticketRef: string;
  subject: string;
  kind: 'sale' | 'purchase';
  reference: string;
  amount: number | null;
  dueDate: string;
  status: string;
  severity: 'overdue' | 'soon';
  daysLeft: number;
  partner: { _id: string; name: string; type: string } | null;
  assignee: { _id: string; name: string } | null;
}

export interface VoucherAlert {
  ticketId: string;
  ticketRef: string;
  subject: string;
  partner: { _id: string; name: string } | null;
  assignee: { _id: string; name: string } | null;
  voucherIssuedAt: string;
  voucherAlertDeadline: string;
  hoursOverdue: number;
}

export interface OverdueTask {
  _id: string;
  title: string;
  dueDate: string;
  assignee?: { _id: string; name: string } | null;
}

export interface OverdueTodo {
  _id: string;
  text: string;
  dueDate: string;
}

export interface AlertCenter {
  total: number;
  payment: { total: number; windowDays: number; alerts: PaymentAlert[] };
  vouchers: { total: number; windowHours: number; alerts: VoucherAlert[] };
  overdueTasks: OverdueTask[];
  overdueTodos: OverdueTodo[];
}
