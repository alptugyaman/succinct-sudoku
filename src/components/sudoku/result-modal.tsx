'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SudokuGrid } from '@/lib/sudoku';
import { generateProof } from '@/lib/api';

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
    const [proofResult, setProofResult] = useState<any>(null);
    const [proofError, setProofError] = useState<string | null>(null);
    const [proofStep, setProofStep] = useState<string>('Initiating proof generation... This may take several minutes to complete.');

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
            setProofStep('Starting ZK Proof generation process... This may take several minutes to complete.');

            console.log('Starting proof generation with original grid and current grid...');

            // Generate proof by calling the /validate-sudoku endpoint
            const validationResult = await generateProof(originalGrid, currentGrid);

            console.log('Proof generation result:', validationResult);

            // Check if we got a valid response with proof_generated
            if (!validationResult || validationResult.is_valid === undefined) {
                throw new Error('Invalid response from the server');
            }

            // If the solution is valid and proof was generated
            if (validationResult.is_valid && validationResult.proof_generated) {
                // Wait for visual effect and show progress messages
                setProofStep('Proof generation successful. Processing results...');
                await new Promise(resolve => setTimeout(resolve, 5000)); // Increased waiting time
                setProofStep('Finalizing proof...');
                await new Promise(resolve => setTimeout(resolve, 3000)); // Additional step

                // Complete the process directly
                handleProofComplete({
                    status: 'complete',
                    message: 'Your Sudoku solution has been successfully proven with ZK Proofs!'
                });
            } else if (validationResult.is_valid && !validationResult.proof_generated) {
                // Valid solution but proof generation failed
                setProofStep('Solution is valid but proof generation failed...');
                await new Promise(resolve => setTimeout(resolve, 5000)); // Increased waiting time

                handleProofComplete({
                    status: 'complete',
                    message: 'Your solution is valid, but we could not generate a ZK Proof.'
                });
            } else {
                // Invalid solution
                throw new Error('Your Sudoku solution is not valid');
            }
        } catch (error) {
            console.error('Proof generation error:', error);
            let errorMessage = 'Proof generation could not be started. Please try again.';

            if (error instanceof Error) {
                // Better processing of API error messages and user-friendly messages
                if (error.message.includes('422')) {
                    errorMessage = 'Invalid Sudoku solution. Please check your solution.';
                } else if (error.message.includes('timed out')) {
                    errorMessage = 'Proof generation timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('Could not connect')) {
                    errorMessage = 'Could not connect to proof generation server. Please try again later.';
                } else {
                    errorMessage = error.message;
                }
            }

            setProofError(errorMessage);
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
                        <h3 className="text-lg font-semibold mb-2">Generate a Proof of Your Solution</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Create a ZKP that you've correctly solved the Sudoku puzzle. The proof generation process may take several minutes to complete.
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
                        <h3 className="text-lg font-semibold mb-3">Generating Proof of Solution</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-[#fe11c5] border-t-transparent rounded-full animate-spin"></div>
                            <p>{proofStep}</p>
                            <p className="text-xs text-gray-500 mt-2">This process can take up to 10 minutes. Please be patient.</p>
                        </div>
                    </div>
                )}

                {proofResult && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 text-[#fe11c5]">Proof Generation Complete!</h3>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You have successfully generated a cryptographic proof that you solved the Sudoku puzzle correctly.
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