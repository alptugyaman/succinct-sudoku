import { SudokuGame } from '@/components/sudoku/game';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <SudokuGame />
    </div>
  );
}
