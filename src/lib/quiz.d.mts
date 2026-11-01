import type { MenuItem } from "./menu";
export type QuizResult = {
  code: string;
  name: string;
  answer: string | null;
  isCorrect: boolean;
};
export function pickQuestions<T extends Pick<MenuItem, "code">>(
  items: readonly T[],
  count?: number,
  random?: () => number,
): T[];
export function appendDigit(current: string, digit: string): string;
export function backspaceDigit(current: string): string;
export function scoreResults(results: readonly Pick<QuizResult, "isCorrect">[]): number;
