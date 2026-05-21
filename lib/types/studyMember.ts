export type StudyMemberRole = "LEADER" | "MEMBER";

export interface StudyMemberResponse {
  memberId: number;
  nickname: string;
  name: string;
  githubUsername: string;
  role: StudyMemberRole;
  joinedAt: string;
  githubRepoName: string | null;
  profileImageUrl?: string | null;
}

export interface StudyMembersResponse {
  members: StudyMemberResponse[];
}

export interface StudyMemberRoleUpdateRequest {
  role: StudyMemberRole;
}

export interface JoinStudyRequest {
  githubRepoName: string;
}

export interface UpdateGithubRepoRequest {
  githubRepoName: string;
}
