import { Button } from "@/components/ui/button";
import { generateProof, trackProofStatus } from "@/lib/api";
import { SudokuGrid } from "@/lib/sudoku";
import { useState, useEffect } from "react";

interface ProofButtonProps {
    initialBoard: SudokuGrid;
    solution: SudokuGrid;
    isValid: boolean;
    onProofResult: (result: {
        success: boolean;
        hash?: string;
        proof_file?: string | null;
        download_url?: string | null;
        error?: string;
    }) => void;
}

export function ProofButton({
    initialBoard,
    solution,
    isValid,
    onProofResult,
}: ProofButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState("");
    const [tracker, setTracker] = useState<{ close: () => void } | null>(null);
    const [connectionError, setConnectionError] = useState(false);

    // Clean up the tracker when component unmounts
    useEffect(() => {
        return () => {
            if (tracker) {
                console.log('🧹 [ProofButton] Cleaning up proof tracker on unmount');
                tracker.close();
            }
        };
    }, [tracker]);

    const handleGenerateProof = async () => {
        console.log('🔘 [ProofButton] Generate proof button clicked');
        if (isGenerating) return;

        try {
            setIsGenerating(true);
            setProgress(0);
            setStep("Starting proof generation...");
            setConnectionError(false);
            console.log('🚀 [ProofButton] Starting proof generation for solution');

            // Generate the proof
            const jobId = await generateProof(initialBoard, solution);
            console.log('🆔 [ProofButton] Received job ID:', jobId);

            // Track the proof status
            const statusTracker = await trackProofStatus(jobId, (status) => {
                console.log('📊 [ProofButton] Received status update:', status);
                if (status.status === "processing" || status.status === "pending") {
                    setProgress(status.progress || 0);
                    setStep(status.step || "Processing...");
                } else if (status.status === "complete") {
                    setIsGenerating(false);
                    setProgress(1);
                    console.log('✅ [ProofButton] Proof generation completed successfully');
                    onProofResult({
                        success: true,
                        hash: status.result?.hash || "unknown",
                        proof_file: status.result?.proof_file || null,
                        download_url: status.result?.download_url || null,
                    });
                } else if (status.status === "failed") {
                    setIsGenerating(false);
                    console.error('❌ [ProofButton] Proof generation failed:', status.error);
                    onProofResult({
                        success: false,
                        error: status.error || "Unknown error",
                    });
                }
            });

            // Now statusTracker is the resolved value, not a Promise
            if (statusTracker) {
                setTracker(statusTracker);
            }
        } catch (error) {
            console.error('❌ [ProofButton] Error in proof generation process:', error);
            setIsGenerating(false);
            setConnectionError(true);

            // Check if it's a network error (backend not available)
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            const isNetworkError = errorMessage.includes("Failed to fetch") ||
                errorMessage.includes("Network Error") ||
                errorMessage.includes("ECONNREFUSED");

            onProofResult({
                success: false,
                error: isNetworkError
                    ? "Cannot connect to the backend server. Please make sure it's running."
                    : errorMessage,
            });
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <Button
                onClick={handleGenerateProof}
                disabled={!isValid || isGenerating}
                className="w-full"
                variant="default"
            >
                {isGenerating ? "Generating Proof..." : "Generate Proof"}
            </Button>

            {connectionError && (
                <div className="text-sm text-red-500 mt-1">
                    Backend server connection failed. Please ensure the backend is running.
                </div>
            )}

            {isGenerating && (
                <div className="w-full">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-in-out"
                            style={{ width: `${progress * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">{step}</p>
                </div>
            )}
        </div>
    );
} 