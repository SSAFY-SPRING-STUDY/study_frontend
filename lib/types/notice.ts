export interface NoticeResponse {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface NoticeRequest {
    title: string;
    content: string;
  }
  