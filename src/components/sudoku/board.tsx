'use client';

import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import Image from 'next/image';

export function SudokuBoard() {
    const {
        grid,
        originalGrid,
        selectedCell,
        selectCell,
        isComplete
    } = useGameStore();

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '1' && e.key <= '9') {
                useGameStore.getState().setNumber(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                useGameStore.getState().clearCell();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="w-full max-w-md aspect-square border-2 border-gray-800 dark:border-gray-600 overflow-hidden shadow-lg relative">
            {/* Background SVG */}
            <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none z-0">
                <Image
                    src="/succinct-icon-pink.svg"
                    alt="Background"
                    width={400}
                    height={400}
                    className="w-4/5 h-4/5 object-contain"
                    priority
                />
            </div>

            <div className="grid grid-cols-9 grid-rows-9 h-full w-full relative z-10">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
                        const isOriginal = originalGrid[rowIndex][colIndex] !== null;
                        const isInSameRow = selectedCell?.[0] === rowIndex;
                        const isInSameCol = selectedCell?.[1] === colIndex;
                        const isInSameBox =
                            selectedCell &&
                            Math.floor(rowIndex / 3) === Math.floor(selectedCell[0] / 3) &&
                            Math.floor(colIndex / 3) === Math.floor(selectedCell[1] / 3);

                        // Add borders for 3x3 boxes - make them more prominent
                        const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-r-gray-800 dark:border-r-gray-600' : 'border-r border-r-gray-500/30 dark:border-r-gray-700/30';
                        const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-b-gray-800 dark:border-b-gray-600' : 'border-b border-b-gray-500/30 dark:border-b-gray-700/30';

                        // Add outer borders for the entire grid
                        const borderTop = rowIndex === 0 ? 'border-t-0' : '';
                        const borderLeft = colIndex === 0 ? 'border-l-0' : '';

                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                className={cn(
                                    'flex items-center justify-center text-xl font-medium transition-colors',
                                    borderRight,
                                    borderBottom,
                                    borderTop,
                                    borderLeft,
                                    isSelected ? 'bg-[#fe11c5]' :
                                        isInSameRow || isInSameCol || isInSameBox ? 'bg-[#fe11c5]/50' :
                                            'bg-white/90 dark:bg-gray-900/90',
                                    isOriginal ? 'font-bold text-black dark:text-white' : 'text-blue-600 dark:text-blue-400',
                                    isComplete ? 'cursor-default' : 'hover:bg-[#fe11c5]/30'
                                )}
                                onClick={() => !isComplete && !isOriginal && selectCell(rowIndex, colIndex)}
                                disabled={isComplete || isOriginal}
                            >
                                {cell || ''}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
} 