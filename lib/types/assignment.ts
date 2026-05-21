export type AssignmentProgressStatus = "APPLIED" | "COMPLETED";

export interface AssignmentRequest {
  title: string;
  content: string;
  prTemplate?: string;
  orderInStudy: number;
}

export interface AssignmentResponse {
  assignmentId: number;
  studyId: number;
  title: string;
  content: string;
  prTemplate?: string;
  orderInStudy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListItemResponse {
  assignmentId: number;
  title: string;
  orderInStudy: number;
  myStatus: AssignmentProgressStatus | null;
}

export interface ApplyAssignmentResponse {
  progressId: number;
  githubIssueNumber: number;
  status: AssignmentProgressStatus;
}

export interface AssignmentProgressResponse {
  progressId: number;
  assignmentId: number;
  title: string;
  orderInStudy: number;
  status: AssignmentProgressStatus;
  githubIssueNumber: number;
  appliedAt: string;
  completedAt: string | null;
}
