import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스들을 병합하는 유틸리티 함수입니다.
 *
 * - clsx를 사용하여 조건부 클래스를 처리합니다.
 * - tailwind-merge를 사용하여 Tailwind 클래스 충돌을 해결합니다.
 *
 * @param inputs - 병합할 클래스들의 배열. ClassValue 타입은 문자열, 객체, 배열 등을 포함할 수 있습니다.
 * @returns 병합된 클래스 문자열
 *
 * @example
 * ```tsx
 * // 버튼 컴포넌트에서의 사용 예시
 * const buttonVariants = cva(
 *   'inline-flex items-center justify-center',
 *   {
 *     variants: {
 *       variant: {
 *         primary: 'bg-violet-500 hover:bg-violet-600',
 *         // ...
 *       },
 *       size: {
 *         sm: 'h-11 text-2xl',
 *         // ...
 *       }
 *     },
 *     defaultVariants: {
 *       variant: 'primary',
 *       size: 'sm'
 *     }
 *   }
 * );
 *
 * const Button = ({ className, variant, size, ...props }) => {
 *   return (
 *     <button
 *       className={cn(
 *         buttonVariants({ variant, size, className }),
 *       )}
 *       {...props}
 *     />
 *   );
 * };
 * ```
 *
 * @see {@link https://github.com/lukeed/clsx clsx}
 * @see {@link https://github.com/dcastil/tailwind-merge tailwind-merge}
 * @see {@link https://github.com/shadcn/ui shadcn/ui}
 * @category Utils
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
