'use client';

import { useGameStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function GameStatus() {
    const { isComplete, getElapsedTime } = useGameStore();
    const [elapsedTime, setElapsedTime] = useState(0);

    // Update the timer every second
    useEffect(() => {
        if (isComplete) {
            setElapsedTime(getElapsedTime());
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime(getElapsedTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [isComplete, getElapsedTime]);

    // Format the time as mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-md flex justify-end items-center mt-4 mb-2">
            <div className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                {formatTime(elapsedTime)}
            </div>
        </div>
    );
} 