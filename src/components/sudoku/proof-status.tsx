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
    status: 'pending' | 'processing' | 'complete' | 'failed' | 'not_found';
    progress?: number;
    result?: any;
    error?: string;
    step?: string;
};

export function ProofStatus({ jobId, onComplete, onError }: ProofStatusProps) {
    const [status, setStatus] = useState<ProofStatus>({ status: 'pending' });
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'closed' | 'error'>('connecting');

    useEffect(() => {
        if (!jobId) return;

        setConnectionStatus('connecting');

        // Start tracking the proof status
        const tracker = trackProofStatus(jobId, (data) => {
            console.log('Proof status update:', data);
            setStatus(data);

            if (data.status === 'processing' || data.status === 'pending') {
                setConnectionStatus('connected');
            } else if (data.status === 'complete') {
                setConnectionStatus('closed');
                onComplete(data.result);
            } else if (data.status === 'failed' || data.status === 'not_found') {
                setConnectionStatus('error');
                onError(data.error || 'Unknown error occurred');
            }
        });

        // Cleanup function
        return () => {
            tracker.close();
        };
    }, [jobId, onComplete, onError]);

    const getStatusText = () => {
        switch (status.status) {
            case 'pending':
                return 'Initializing proof generation...';
            case 'processing':
                return status.step || `Generating proof... ${status.progress ? `${Math.round(status.progress * 100)}%` : ''}`;
            case 'complete':
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

                {status.status === 'processing' && (
                    <div className="w-full space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-[#fe11c5] h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${status.progress ? Math.round(status.progress * 100) : 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-right text-gray-600 dark:text-gray-400">
                            {status.progress ? `${Math.round(status.progress * 100)}%` : '0%'}
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