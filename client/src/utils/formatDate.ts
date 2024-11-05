/**
 * 날짜를 지정된 형식의 문자열로 포맷팅하는 유틸리티 함수입니다.
 *
 * - 날짜 객체를 받아 원하는 형식의 문자열로 변환합니다.
 * - 기본 형식은 'YYYY-MM-DD'입니다.
 * - 유효하지 않은 날짜가 입력되면 에러를 발생시킵니다.
 *
 * @param date - 포맷팅할 Date 객체
 * @param format - 날짜 포맷 문자열 (기본값: 'YYYY-MM-DD')
 * @returns 포맷팅된 날짜 문자열
 * @throws {Error} 유효하지 않은 날짜가 입력된 경우
 *
 * @example
 * ```typescript
 * // 기본 포맷 (YYYY-MM-DD)
 * formatDate(new Date()); // "2024-03-04"
 *
 * // 커스텀 포맷
 * formatDate(new Date(), 'YYYY년 MM월 DD일'); // "2024년 03월 04일"
 * formatDate(new Date(), 'MM/DD/YYYY'); // "03/04/2024"
 *
 * // 에러 케이스
 * formatDate(new Date('invalid')); // Error: Invalid date provided
 * ```
 *
 * @category Utils
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const replacements: Record<string, string> = {
    YYYY: year.toString(),
    MM: month.toString().padStart(2, '0'),
    DD: day.toString().padStart(2, '0'),
  };

  return format.replace(/YYYY|MM|DD/g, (match) => replacements[match]);
}
