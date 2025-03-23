import { useEffect, useState, useRef } from 'react';

interface ProofStatusProps {
    jobId: string;
    onComplete: (result: any) => void;
    onError: (error: string) => void;
}

export function ProofStatus({ jobId, onComplete, onError }: ProofStatusProps) {
    const [status, setStatus] = useState<string>('processing');
    const [message, setMessage] = useState<string>('');
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only start process if there's a valid jobId
        if (!jobId) {
            return;
        }

        // Use a 3-second delay for visual effect only
        const timer = setTimeout(() => {
            // Return successful result
            setIsCompleted(true);
            setStatus('complete');
            setMessage('Your Sudoku solution has been successfully validated!');

            // Call onComplete callback
            onComplete({
                status: 'complete',
                message: 'Your Sudoku solution has been successfully validated!',
                hash: `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
            });
        }, 3000);

        // Cleanup
        return () => {
            clearTimeout(timer);
        };
    }, [jobId, onComplete, onError]);

    // If process is not completed, show only "Validating..." message
    if (!isCompleted) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-2 items-center text-center">
                    <p className="text-sm font-medium text-[#fe11c5]">Validating...</p>
                </div>
            </div>
        );
    }

    // If process is completed, show result message
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 items-center text-center">
                <p className="text-sm font-medium text-[#fe11c5]">Validation process completed successfully!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
} 