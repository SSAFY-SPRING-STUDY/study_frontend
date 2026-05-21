export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface MemberInfo {
    id: number;
    email: string;
    name: string;
    nickname: string;
    level: string;
    role: string;
    githubUsername: string | null;
    description: string | null;
    profileImageUrl: string | null;
  }
  