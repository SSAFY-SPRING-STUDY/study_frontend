export interface ImageRequest {
    contentType: string;
    contentLength: number;
    fileName: string;
  }
  
  export interface ImageResponse {
    imageUrl: string;
    imageKey: string;
    imageId: number;
  }
  