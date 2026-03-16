export interface PostRequest {
    title: string;
    content: string;
    imageIds?: number[];
  }
  
  export interface PostSimpleResponse {
    postId: number;
    title: string;
    authorId: number;
    authorName: string;
    curriculumId: number;
    orderInCurriculum: number;
  }
  
  export interface PostDetailResponse {
    postId: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    curriculumId: number;
    orderInCurriculum: number;
  }
  