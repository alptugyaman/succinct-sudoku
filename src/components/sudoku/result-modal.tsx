'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { generateProof, verifySudoku } from '@/lib/api';
import { SudokuGrid } from '@/lib/sudoku';
import { ProofStatus } from './proof-status';
import Link from 'next/link';

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

    // Extract filename from proof file path
    const getProofFilename = () => {
        if (!proofResult?.proof_file) return '';
        const parts = proofResult.proof_file.split('/');
        return parts[parts.length - 1];
    };

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
            setProofStep('Verifying solution...');

            // First verify the solution on the server
            const verificationResult = await verifySudoku(originalGrid, currentGrid);

            if (!verificationResult.valid) {
                setProofError('Solution verification failed. Please try again.');
                setIsGeneratingProof(false);
                return;
            }

            setProofStep('Initiating proof generation...');

            // Generate the proof
            const jobId = await generateProof(originalGrid, currentGrid);
            setProofJobId(jobId);
            setProofStep('Proof generation started. Connecting to server...');
        } catch (error) {
            console.error('Error starting proof generation:', error);
            setProofError('Failed to start proof generation. Please try again.');
            setIsGeneratingProof(false);
        }
    };

    // Handle proof completion
    const handleProofComplete = (result: any) => {
        setProofResult(result);
        setIsGeneratingProof(false);
        setProofStep('');
    };

    // Handle proof error
    const handleProofError = (error: string) => {
        setProofError(error);
        setIsGeneratingProof(false);
        setProofStep('');
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
                        <h3 className="text-lg font-semibold mb-2 text-[#fe11c5]">Proof Generated Successfully!</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-semibold">Proof Hash:</p>
                                <p className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-300 dark:border-gray-700 break-all font-mono">
                                    {proofResult.hash || 'N/A'}
                                </p>
                            </div>

                            {proofResult.proof_file && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Proof File:</p>
                                    <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-300 dark:border-gray-700 mb-3">
                                        <p className="text-xs font-mono break-all">{getProofFilename()}</p>
                                    </div>
                                    <Link
                                        href={proofResult.download_url || proofResult.proof_file}
                                        target="_blank"
                                        download
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#fe11c5] hover:bg-[#fe11c5]/80 text-white font-medium border-2 border-gray-800 dark:border-gray-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Proof
                                    </Link>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                        This file contains a cryptographic proof that you solved the Sudoku puzzle correctly.
                                    </p>
                                </div>
                            )}

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You can share this proof with others to verify that you solved the puzzle without revealing your solution.
                            </p>
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