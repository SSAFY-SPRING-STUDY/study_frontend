export type StudyType = "BACKEND" | "ALGORITHM" | "COMPUTER_SCIENCE";
export type StudyLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface StudyRequest {
  name: string;
  description: string;
  level: StudyLevel;
  type: StudyType;
  githubOrgName?: string;
  githubRepoName?: string;
  githubWebhookSecret?: string;
}

export interface StudyResponse {
  id: number;
  name: string;
  description: string;
  level: StudyLevel;
  type: StudyType;
  githubOrgName?: string;
  githubRepoName?: string;
}
