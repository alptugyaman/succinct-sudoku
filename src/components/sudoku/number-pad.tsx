'use client';

import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function NumberPad() {
    const { setNumber, clearCell, isComplete } = useGameStore();

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="grid grid-cols-5 gap-2 w-full max-w-md mt-4">
            {numbers.map((num) => (
                <button
                    key={num}
                    className={cn(
                        "h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
                        "text-xl font-medium text-gray-900 dark:text-gray-100",
                        "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    onClick={() => setNumber(num)}
                    disabled={isComplete}
                >
                    {num}
                </button>
            ))}
            <button
                className={cn(
                    "h-12 bg-[#fe11c5] dark:bg-[#fe11c5]/50 border border-[#fe11c5]-300 dark:border-red-700",
                    "text-m font-medium text-red-900 dark:text-red-100",
                    "hover:bg-[#fe11c5]/60 dark:hover:bg-[#fe11c5]/80 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={clearCell}
                disabled={isComplete}
            >
                Clear
            </button>
        </div>
    );
} 