import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合するユーティリティ関数
 *
 * @description
 * - clsx を使用してクラス名を条件付きで結合
 * - tailwind-merge を使用してTailwind CSSクラスの重複を解決
 * - shadcn/ui の標準的なクラス名結合パターン
 *
 * @param inputs - 結合するクラス名の配列
 * @returns 結合されたクラス名の文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
