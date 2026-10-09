export interface StatusCount {
  _id: string;
  count: number;
}

export interface AdminOverview {
  tasksByStatus: StatusCount[];
  ticketsByStatus: StatusCount[];
  overdueCount: number;
}

export interface WorkloadEntry {
  userId: string;
  name: string;
  role: string;
  openCount: number;
}
