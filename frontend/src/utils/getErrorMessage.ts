export function getErrorMessage(
  error: unknown,
  fallback = 'Đã xảy ra lỗi khi xử lý yêu cầu.',
): string {
  return error instanceof Error ? error.message : fallback;
}
