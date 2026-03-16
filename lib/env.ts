/**
 * API 서버 주소. 배포 시 NEXT_PUBLIC_API_BASE_URL을 빌드/런타임에 설정.
 * 개발: http://localhost:8080 (또는 .env.local 참고)
 */
function getApiBaseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    return raw.replace(/\/$/, "");
  }
  
/** API v1 베이스 (예: http://localhost:8080/api/v1). 미설정 시 상대 경로 /api/v1 사용(프록시 가능) */
export const API_V1_BASE =
    getApiBaseUrl() ? `${getApiBaseUrl()}/api/v1` : "/api/v1";
