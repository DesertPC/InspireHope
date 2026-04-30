export interface Case {
  id: string;
  seniorId: string;
  caseNumber: string;
  serviceType: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  assignedTo: string | null;
  resourcesMoneyAllocated: number;
  volunteerHoursAllocated: number;
  volunteerHoursUsed: number;
  startDate: string | null;
  targetDate: string | null;
  completionDate: string | null;
  outcomeNotes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
