'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { trackProofStatus } from '@/lib/api';

interface ProofStatusProps {
    jobId: string | null;
    onComplete: (result: any) => void;
    onError: (error: string) => void;
}

type ProofStatus = {
    status: 'pending' | 'processing' | 'complete' | 'completed' | 'success' | 'failed' | 'not_found';
    progress?: number;
    message?: string;
    result?: any;
    error?: string;
    logs?: string[];
    originalStatus?: string;
    proof_available?: boolean;
};

export function ProofStatus({ jobId, onComplete, onError }: ProofStatusProps) {
    const [status, setStatus] = useState<ProofStatus>({ status: 'pending' });
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'closed' | 'error'>('connecting');
    const [isChecking, setIsChecking] = useState(false);

    // Function to check the proof status
    const checkProofStatus = async () => {
        if (!jobId) return;

        setIsChecking(true);
        setConnectionStatus('connecting');

        try {
            // Call the trackProofStatus function which now makes a single request
            await trackProofStatus(jobId, (data) => {
                console.log('Proof status update:', data);
                setStatus(data);

                if (data.status === 'processing' || data.status === 'pending') {
                    setConnectionStatus('connected');
                } else if (data.status === 'complete' || data.status === 'completed' || data.status === 'success') {
                    setConnectionStatus('closed');
                    onComplete(data.result || data);
                } else if (data.status === 'failed' || data.status === 'not_found') {
                    setConnectionStatus('error');
                    onError(data.error || 'Unknown error occurred');
                }
            });
        } catch (error) {
            console.error('Error checking proof status:', error);
            setConnectionStatus('error');
        } finally {
            setIsChecking(false);
        }
    };

    // Check status once when component mounts
    useEffect(() => {
        checkProofStatus();
    }, [jobId]);

    const getStatusText = () => {
        // If we have a specific message from the backend, use it
        if (status.message) {
            return status.message;
        }

        switch (status.status) {
            case 'pending':
                return 'Initializing proof generation...';
            case 'processing':
                return 'Generating zero-knowledge proof...';
            case 'complete':
            case 'completed':
            case 'success':
                return 'Proof generation complete!';
            case 'failed':
                return `Proof generation failed: ${status.error || 'Unknown error'}`;
            case 'not_found':
                return 'Proof job not found';
            default:
                return 'Unknown status';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connecting':
                return 'Connecting to server...';
            case 'connected':
                return 'Connected to server';
            case 'closed':
                return 'Connection closed';
            case 'error':
                return 'Connection error';
            default:
                return '';
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center gap-2 w-full">
                    <div
                        className={cn(
                            "w-3 h-3 rounded-full",
                            connectionStatus === 'connected' ? "bg-green-500" :
                                connectionStatus === 'connecting' ? "bg-yellow-500" :
                                    connectionStatus === 'error' ? "bg-red-500" : "bg-gray-500"
                        )}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getConnectionStatusText()}
                    </p>
                </div>

                <p className="text-center font-medium">
                    {getStatusText()}
                </p>

                {(status.status === 'processing' || status.status === 'pending') && (
                    <div className="w-full space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-[#fe11c5] h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${status.progress ? Math.round(status.progress) : 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-right text-gray-600 dark:text-gray-400">
                            {status.progress ? `${Math.round(status.progress)}%` : '0%'}
                        </p>
                    </div>
                )}

                {/* Check Status Button */}
                {(status.status === 'processing' || status.status === 'pending') && (
                    <button
                        onClick={checkProofStatus}
                        disabled={isChecking}
                        className={cn(
                            "mt-2 px-4 py-2 rounded-md text-sm font-medium",
                            "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                            "focus:outline-none focus:ring-2 focus:ring-[#fe11c5] focus:ring-opacity-50",
                            "transition-colors",
                            isChecking && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isChecking ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Checking...
                            </span>
                        ) : (
                            "Check Status"
                        )}
                    </button>
                )}

                {/* Display download button when proof is available */}
                {(status.status === 'completed' || status.status === 'success' || status.proof_available) && status.result && (
                    <div className="w-full mt-4">
                        <a
                            href={status.result.proof_file || status.result.proof_url || '#'}
                            download
                            className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md",
                                "bg-[#fe11c5] hover:bg-[#d10ea6] text-white font-medium transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-[#fe11c5] focus:ring-opacity-50",
                                (!status.result.proof_file && !status.result.proof_url) && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={(e) => {
                                if (!status.result.proof_file && !status.result.proof_url) {
                                    e.preventDefault();
                                    alert('Proof file is not available for download');
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Proof
                        </a>
                    </div>
                )}

                {/* Display the latest log entry if available */}
                {status.logs && status.logs.length > 0 && (
                    <div className="w-full mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-hidden">
                        <p className="truncate text-gray-600 dark:text-gray-400">
                            {status.logs[status.logs.length - 1]}
                        </p>
                    </div>
                )}

                {status.status === 'failed' && (
                    <div className="w-full p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <p className="text-red-500 text-sm">{status.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 