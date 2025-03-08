'use client';

import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ResultModal } from './result-modal';

export function GameControls() {
    const { startNewGame, isComplete, getElapsedTime, checkSolution, grid, startTime } = useGameStore();
    const [showResultModal, setShowResultModal] = useState(false);
    const [isCorrectSolution, setIsCorrectSolution] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [previousEmptyCount, setPreviousEmptyCount] = useState(9);
    const [currentEmptyCount, setCurrentEmptyCount] = useState(9);
    const [timerStopped, setTimerStopped] = useState(false);

    // Check if the game has started (timer is running)
    const gameStarted = startTime !== null;

    // Update the timer every second
    useEffect(() => {
        // If the timer is stopped, the game is complete, or the game hasn't started, don't update
        if (timerStopped || isComplete || !gameStarted) {
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime(getElapsedTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [isComplete, getElapsedTime, timerStopped, gameStarted]);

    // Count empty cells and check if all cells are filled
    useEffect(() => {
        // Only check if the game has started
        if (!gameStarted) return;

        let count = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === null) {
                    count++;
                }
            }
        }

        setPreviousEmptyCount(currentEmptyCount);
        setCurrentEmptyCount(count);
    }, [grid, currentEmptyCount, gameStarted]);

    // Show result modal when all cells are filled
    useEffect(() => {
        // Only check if the game has started
        if (!gameStarted) return;

        if (previousEmptyCount > 0 && currentEmptyCount === 0 && !showResultModal) {
            const isCorrect = checkSolution();
            setIsCorrectSolution(isCorrect);
            setShowResultModal(true);
            // Stop the timer when the game is complete
            setTimerStopped(true);
            // Set the final elapsed time
            setElapsedTime(getElapsedTime());
        }
    }, [previousEmptyCount, currentEmptyCount, checkSolution, showResultModal, getElapsedTime, gameStarted]);

    // Format the time as mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleNewGame = () => {
        startNewGame('easy');
        setShowResultModal(false);
        setTimerStopped(false);
    };

    // For now, the Prove button will just close the modal
    // Later, we can implement a different logic for it
    const handleCloseModal = () => {
        // This function will be used for the Prove button
        // For now, it just keeps the modal open and does nothing
        console.log("Prove button clicked - future functionality will be implemented here");
    };

    return (
        <div className="w-full max-w-md space-y-4 mt-6">
            <div className="flex justify-between items-center">
                <button
                    className="flex-1 px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors mr-4"
                    onClick={handleNewGame}
                >
                    New Game
                </button>

                {gameStarted && (
                    <div className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 border-2 border-gray-800 dark:border-gray-600">
                        {formatTime(elapsedTime)}
                    </div>
                )}
            </div>

            {showResultModal && (
                <ResultModal
                    isCorrect={isCorrectSolution}
                    elapsedTime={elapsedTime}
                    onClose={handleCloseModal}
                    onNewGame={handleNewGame}
                />
            )}
        </div>
    );
} 