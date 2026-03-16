/** 모든 API 공통 응답 래퍼 */
export interface ApiResponse<T> {
    message: string;
    data: T | null;
  }
  
  /** Spring Page (페이지네이션) */
  export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }
  