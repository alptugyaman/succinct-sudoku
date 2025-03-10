'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { trackProofStatus, connectToLogStream } from '@/lib/api';

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
    const [liveLogs, setLiveLogs] = useState<string[]>([]);
    const [isStreamingLogs, setIsStreamingLogs] = useState(false);
    const logStreamRef = useRef<{ close: () => void, isConnected: () => boolean } | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    // Set to track unique log messages
    const seenLogsRef = useRef<Set<string>>(new Set());

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

                    // If we got a 200 response and we're not already streaming logs, start streaming
                    if (!isStreamingLogs) {
                        startLogStream();
                    }
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

    // Function to start streaming logs
    const startLogStream = () => {
        if (!jobId || isStreamingLogs) return;

        try {
            // Reset seen logs when starting a new stream
            seenLogsRef.current = new Set();

            // Close existing connection if any
            if (logStreamRef.current) {
                logStreamRef.current.close();
            }

            // Connect to log stream
            logStreamRef.current = connectToLogStream(
                jobId,
                (log) => {
                    // Process the log line
                    // Remove any ANSI color codes or special characters
                    const cleanLog = log.replace(/\u001b\[\d+m/g, '').trim();

                    if (cleanLog) {
                        // Check if we've already seen this exact log message
                        if (!seenLogsRef.current.has(cleanLog)) {
                            // Add to seen logs set
                            seenLogsRef.current.add(cleanLog);

                            // Update the live logs state
                            setLiveLogs(prev => {
                                // Limit the number of logs to prevent memory issues
                                const newLogs = [...prev, cleanLog];
                                if (newLogs.length > 100) {
                                    return newLogs.slice(-100); // Keep only the last 100 logs
                                }
                                return newLogs;
                            });

                            // Scroll to bottom of logs
                            if (logsEndRef.current) {
                                logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
                            }

                            // Check for important log messages and update progress
                            if (cleanLog.includes('Proof successfully generated') ||
                                cleanLog.includes('Proof generation completed') ||
                                cleanLog.includes('Job status updated to \'Complete\'')) {
                                // Update status to show proof is ready
                                setStatus(prev => ({
                                    ...prev,
                                    status: 'completed',
                                    progress: 100,
                                    message: 'Proof generation completed!',
                                    proof_available: true
                                }));

                                // Notify parent component
                                onComplete({
                                    status: 'completed',
                                    progress: 100,
                                    message: 'Proof generation completed!',
                                    proof_available: true
                                });
                            }
                            // Update progress based on log messages
                            else if (cleanLog.includes('generate_proof started')) {
                                setStatus(prev => ({ ...prev, progress: 10 }));
                            }
                            else if (cleanLog.includes('Validating solution')) {
                                setStatus(prev => ({ ...prev, progress: 20 }));
                            }
                            else if (cleanLog.includes('Creating ProverClient')) {
                                setStatus(prev => ({ ...prev, progress: 30 }));
                            }
                            else if (cleanLog.includes('Preparing SP1 inputs')) {
                                setStatus(prev => ({ ...prev, progress: 40 }));
                            }
                            else if (cleanLog.includes('Running SP1 program')) {
                                setStatus(prev => ({ ...prev, progress: 50 }));
                            }
                            else if (cleanLog.includes('SP1 execution result')) {
                                setStatus(prev => ({ ...prev, progress: 60 }));
                            }
                            else if (cleanLog.includes('Setting up prover')) {
                                setStatus(prev => ({ ...prev, progress: 70 }));
                            }
                            else if (cleanLog.includes('Verification key')) {
                                setStatus(prev => ({ ...prev, progress: 80 }));
                            }
                            else if (cleanLog.includes('Proof successfully generated')) {
                                setStatus(prev => ({ ...prev, progress: 90 }));
                            }
                            else if (cleanLog.includes('Proof generation process completed')) {
                                setStatus(prev => ({ ...prev, progress: 95 }));
                            }
                        } else {
                            console.log('🔄 [Client] Skipping duplicate log:', cleanLog);
                        }
                    }
                },
                (error) => {
                    console.error('Log stream error:', error);

                    // WebSocket hatası durumunda, kullanıcıya bilgi verme
                    // Sadece bağlantı durumunu güncelle
                    setConnectionStatus('error');

                    // Hata mesajını loglara ekleme
                    // Kullanıcıya gösterme

                    // Hata durumunda işlemin tamamlandığını bildirme
                }
            );

            setIsStreamingLogs(true);
        } catch (error: unknown) {
            console.error('Error starting log stream:', error);
            setConnectionStatus('error');

            // Hata durumunda bile kullanıcıya bilgi ver
            setLiveLogs(prev => [...prev, `Error connecting to log stream: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
    };

    // Cleanup function for WebSocket connection
    useEffect(() => {
        return () => {
            if (logStreamRef.current) {
                logStreamRef.current.close();
            }
        };
    }, []);

    // Check status once when component mounts
    useEffect(() => {
        checkProofStatus();
    }, [jobId]);

    // Scroll to bottom when new logs arrive
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [liveLogs]);

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

                {/* Live Logs Section */}
                {isStreamingLogs && (
                    <div className="w-full mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">Live Logs:</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {liveLogs.length} log entries
                                </span>
                                <button
                                    onClick={() => setLiveLogs([])}
                                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                                    title="Clear logs"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div className="w-full h-48 bg-black text-green-400 p-2 rounded-md font-mono text-xs overflow-y-auto">
                            {liveLogs.length > 0 ? (
                                liveLogs.map((log, index) => {
                                    // Bağlantı hatası mesajlarını gösterme
                                    if (log.includes('Connection error')) {
                                        return null;
                                    }

                                    // Highlight important log messages
                                    const isError = log.toLowerCase().includes('error') && !log.includes('Connection error');
                                    const isWarning = log.toLowerCase().includes('warning');
                                    const isSuccess = log.includes('vk verification: true') ||
                                        log.includes('Proof successfully generated');
                                    const isJobId = log.includes(jobId || '');

                                    // Extract the log type/prefix if available
                                    let logPrefix = '';
                                    let logContent = log;

                                    if (log.includes(':')) {
                                        const parts = log.split(':', 2);
                                        if (parts.length === 2) {
                                            logPrefix = parts[0].trim();
                                            logContent = parts[1].trim();
                                        }
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "whitespace-pre-wrap break-all py-0.5",
                                                isError && "text-red-400",
                                                isWarning && "text-yellow-400",
                                                isSuccess && "text-green-500 font-bold",
                                                isJobId && "opacity-70"
                                            )}
                                        >
                                            {logPrefix && (
                                                <span className="text-blue-400 mr-1">{logPrefix}:</span>
                                            )}
                                            {logContent}
                                        </div>
                                    );
                                }).filter(Boolean) // null değerleri filtrele
                            ) : (
                                <div className="text-gray-500">Waiting for logs...</div>
                            )}
                            <div ref={logsEndRef} />
                        </div>
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