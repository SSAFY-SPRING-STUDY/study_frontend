export interface CommentRequest {
  content: string;
}

export interface CommentResponse {
  commentId: number;
  content: string;
  authorId: number;
  authorName: string;
  postId: number;
  reCommentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReCommentResponse {
  reCommentId: number;
  content: string;
  authorId: number;
  authorName: string;
  parentCommentId: number;
  createdAt: string;
  updatedAt: string;
}
