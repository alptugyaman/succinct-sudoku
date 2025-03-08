'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ResultModalProps {
    isCorrect: boolean;
    elapsedTime: number;
    onClose: () => void;
    onNewGame: () => void;
}

export function ResultModal({ isCorrect, elapsedTime, onClose, onNewGame }: ResultModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Format the time as mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Get motivational message based on time and correctness
    const getMotivationalMessage = () => {
        if (isCorrect) {
            if (elapsedTime < 30) {
                return "Wow! That was lightning fast! You're a Sudoku master!";
            } else if (elapsedTime < 60) {
                return "Great job! You solved it quickly and accurately!";
            } else {
                return "Well done! Your persistence paid off!";
            }
        } else {
            return "Don't worry! Sudoku takes practice. Keep trying!";
        }
    };

    // Get congratulatory or consolation title
    const getTitle = () => {
        if (isCorrect) {
            const titles = [
                "Congratulations!",
                "Brilliant!",
                "Amazing Work!",
                "You Did It!",
                "Fantastic Job!"
            ];
            return titles[Math.floor(Math.random() * titles.length)];
        } else {
            const titles = [
                "Not Quite Right",
                "Keep Trying!",
                "Almost There!",
                "Don't Give Up!",
                "Practice Makes Perfect!"
            ];
            return titles[Math.floor(Math.random() * titles.length)];
        }
    };

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className={cn(
                "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0"
            )}
        >
            <div
                className={cn(
                    "bg-white dark:bg-gray-800 p-6 max-w-md w-full shadow-xl transition-all duration-300 transform border-2 border-gray-800 dark:border-gray-600",
                    isVisible ? "scale-100" : "scale-95",
                    "flex flex-col gap-4"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-[#fe11c5]">
                    {getTitle()}
                </h2>

                <div className="text-center space-y-2">
                    {isCorrect ? (
                        <>
                            <p>You solved the puzzle in <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>!</p>
                            <p className="text-[#fe11c5]">{getMotivationalMessage()}</p>
                        </>
                    ) : (
                        <>
                            <p>Your solution is not correct.</p>
                            <p className="text-[#fe11c5]">{getMotivationalMessage()}</p>
                        </>
                    )}
                </div>

                <div className={cn("flex gap-2 mt-2", isCorrect ? "justify-between" : "justify-center")}>
                    <button
                        className="flex-1 px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors"
                        onClick={onNewGame}
                    >
                        New Game
                    </button>

                    {isCorrect && (
                        <button
                            className="flex-1 px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors"
                            onClick={onClose}
                        >
                            Prove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 