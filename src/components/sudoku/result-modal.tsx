'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SudokuGrid } from '@/lib/sudoku';
import { generateProof } from '@/lib/api';
import { ProofStatus } from './proof-status';

interface ResultModalProps {
    isCorrect: boolean;
    elapsedTime: number;
    onClose: () => void;
    onNewGame: () => void;
    originalGrid: SudokuGrid;
    currentGrid: SudokuGrid;
}

export function ResultModal({
    isCorrect,
    elapsedTime,
    onClose,
    onNewGame,
    originalGrid,
    currentGrid
}: ResultModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const [proofJobId, setProofJobId] = useState<string | null>(null);
    const [proofResult, setProofResult] = useState<any>(null);
    const [proofError, setProofError] = useState<string | null>(null);
    const [proofStep, setProofStep] = useState<string>('');

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

    // Handle Prove button click
    const handleProve = async () => {
        if (!isCorrect) return;

        try {
            setIsGeneratingProof(true);
            setProofError(null);
            setProofResult(null);
            setProofStep('Initiating proof generation...');

            // Generate the proof by calling the /api/prove endpoint
            const jobId = await generateProof(originalGrid, currentGrid);

            if (!jobId) {
                throw new Error('Failed to get a valid job ID from the server');
            }

            // Add a 5-second delay before setting up WebSocket connection
            setProofStep('Proof generation started. Waiting for server processing...');

            // Wait for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Now set the job ID to start tracking with WebSocket
            setProofJobId(jobId);
            setProofStep('Connecting to server for proof status...');
        } catch (error) {
            setProofError(error instanceof Error ? error.message : 'Failed to start proof generation. Please try again.');
            setIsGeneratingProof(false);
        }
    };

    // Handle proof completion
    const handleProofComplete = (result: any) => {
        setProofResult(result);
        setIsGeneratingProof(false);
    };

    // Handle proof error
    const handleProofError = (error: string) => {
        setProofError(error);
        setIsGeneratingProof(false);
    };

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

                {isCorrect && !isGeneratingProof && !proofResult && !proofError && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Generate Zero-Knowledge Proof</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Create a cryptographic proof that you solved this Sudoku puzzle without revealing your solution.
                        </p>
                        <button
                            className="w-full px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors"
                            onClick={handleProve}
                        >
                            Generate Proof
                        </button>
                    </div>
                )}

                {isGeneratingProof && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h3 className="text-lg font-semibold mb-3">Generating Zero-Knowledge Proof</h3>
                        {proofJobId ? (
                            <ProofStatus
                                jobId={proofJobId}
                                onComplete={handleProofComplete}
                                onError={handleProofError}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-[#fe11c5] border-t-transparent rounded-full animate-spin"></div>
                                <p>{proofStep}</p>
                            </div>
                        )}
                    </div>
                )}

                {proofResult && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 text-[#fe11c5]">Proof Generation Completed!</h3>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You have successfully generated a zero-knowledge proof that you solved the Sudoku puzzle without revealing your solution.
                            </p>
                            <p className="text-sm font-medium">
                                The proof has been verified and recorded. Your achievement is now cryptographically proven!
                            </p>
                            {proofResult.hash && (
                                <div className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded font-mono overflow-x-auto">
                                    <span className="font-semibold">Proof Hash:</span> {proofResult.hash}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {proofError && (
                    <div className="mt-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Proof Generation Failed</h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{proofError}</p>
                        <button
                            className="px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors text-sm"
                            onClick={handleProve}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <button
                        className="flex-1 px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors"
                        onClick={onNewGame}
                    >
                        New Game
                    </button>
                </div>
            </div>
        </div>
    );
} 