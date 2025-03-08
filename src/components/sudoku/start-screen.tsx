'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface StartScreenProps {
    onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className={cn(
                "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0"
            )}
        >
            <div
                className={cn(
                    "bg-white dark:bg-gray-900 p-8 max-w-lg w-full shadow-xl transition-all duration-300 transform border-2 border-[#fe11c5]",
                    isVisible ? "scale-100" : "scale-95",
                    "flex flex-col gap-8 items-center"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="text-4xl text-gray-900 dark:text-white font-bold text-center flex items-center justify-center">
                    <span className="inline-flex items-center justify-center h-10 w-7 relative -mt-1">
                        <Image
                            src="/succinct-icon-pink.svg"
                            alt="S"
                            width={28}
                            height={28}
                            className="object-contain"
                            priority
                        />
                    </span>
                    uccinct Sudoku
                </h1>

                <div className="text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Fill in the grid so that every row, column, and 3×3 box contains the digits 1 through 9.
                    </p>
                </div>

                <div className="space-y-4 w-full">
                    <h2 className="text-xl font-semibold text-[#fe11c5]">How to Play:</h2>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-5">
                        <li>Click on an empty cell to select it</li>
                        <li>Use the number pad below the grid to enter a number</li>
                        <li>Use the "Clear" button to remove a number</li>
                        <li>The game is complete when all cells are filled correctly</li>
                        <li>Your time will start when you make your first move</li>
                    </ul>
                </div>

                <div className="space-y-4 w-full">
                    <h2 className="text-xl font-semibold text-[#fe11c5]">Tips:</h2>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-5">
                        <li>Look for rows, columns, or boxes with only a few empty cells</li>
                        <li>Eliminate possibilities by checking what numbers are already in each row, column, and box</li>
                        <li>If you get stuck, try looking for cells that can only contain one possible number</li>
                    </ul>
                </div>

                <button
                    className={cn(
                        "w-full px-6 py-4 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600",
                        "text-xl transition-colors shadow-md hover:shadow-lg"
                    )}
                    onClick={onStart}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
} 