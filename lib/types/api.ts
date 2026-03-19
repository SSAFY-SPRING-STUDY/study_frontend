/** 모든 API 공통 응답 래퍼 */
export interface ApiResponse<T> {
    message: string;
    data: T | null;
  }
  
  /** Spring Page (페이지네이션) — Spring Boot 3.3+ nested page object */
  export interface Page<T> {
    content: T[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  }
  