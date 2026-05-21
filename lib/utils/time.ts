export function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 60_000) return "방금 전";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}일 전`;
  return `${Math.floor(diff / 2_592_000_000)}달 전`;
}
