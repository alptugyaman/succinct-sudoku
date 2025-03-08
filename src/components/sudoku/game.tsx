'use client';

import { useGameStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { SudokuBoard } from './board';
import { GameControls } from './game-controls';
import { NumberPad } from './number-pad';
import { StartScreen } from './start-screen';
import Image from 'next/image';

export function SudokuGame() {
    const { startNewGame } = useGameStore();
    const [gameStarted, setGameStarted] = useState(false);

    // Initialize an empty board for display before the game starts
    useEffect(() => {
        if (!gameStarted) {
            // Initialize with an empty board but don't start the timer
            startNewGame('easy', false);
        }
    }, []);

    const handleStartGame = () => {
        // Start a new game when the user clicks Start
        startNewGame('easy', true);
        setGameStarted(true);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
                <span className="inline-flex items-center justify-center h-9 w-6 relative -mt-1">
                    <Image
                        src="/succinct-icon-pink.svg"
                        alt="S"
                        width={24}
                        height={24}
                        className="object-contain"
                        priority
                    />
                </span>
                udoku Game
            </h1>

            <SudokuBoard />
            <NumberPad />
            <GameControls />

            {!gameStarted && (
                <StartScreen onStart={handleStartGame} />
            )}
        </div>
    );
} 