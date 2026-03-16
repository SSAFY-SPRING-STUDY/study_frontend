export interface CurriculumRequest {
    name: string;
    description: string;
    order: number;
  }
  
  export interface CurriculumResponse {
    id: number;
    title: string;
    description: string;
    order: number;
    postsCount: number;
  }
  