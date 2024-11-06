import { useEffect, useState } from 'react';

/**
 * 입력값의 변경을 지연시키는 디바운스 훅입니다.
 *
 * - 연속적인 값의 변경에서 마지막 값만 반영하도록 지연시킵니다.
 * - 주로 검색, 입력 필드 등 연속적인 이벤트를 제어할 때 사용됩니다.
 *
 * @typeParam T - 디바운스할 값의 타입
 * @param value - 디바운스할 원본 값
 * @param delay - 디바운스 지연 시간 (밀리초 단위, 기본값: 3000ms)
 * @returns 지연된 값 (디바운스된 값)
 *
 * @example
 * ```tsx
 * // 검색어 입력에 디바운스 적용
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     // debouncedSearchTerm이 변경될 때만 API 호출
 *     if (debouncedSearchTerm) {
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="검색어를 입력하세요"
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link https://web.dev/articles/debounce 디바운스에 대해 자세히 알아보기}
 * @category Hooks
 */
export function useDebounce<T>(value: T, delay: number = 3000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
