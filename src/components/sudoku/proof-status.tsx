import { useEffect, useState, useRef } from 'react';
import { pollProofStatus } from '@/lib/api';

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
        // Sadece geçerli bir jobId varsa polling başlat
        if (!jobId) {
            return;
        }

        // İlk durumu hemen kontrol et
        checkStatus();

        // Polling interval'ı başlat (saniyede 1 kez)
        intervalRef.current = setInterval(checkStatus, 1000);

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        // Status kontrol fonksiyonu
        async function checkStatus() {
            try {
                const statusData = await pollProofStatus(jobId);

                // Update status
                if (statusData.status) {
                    setStatus(statusData.status);

                    // Update message if available
                    if (statusData.message) {
                        setMessage(statusData.message);
                    }

                    // If status is complete, call onComplete and stop polling
                    if (statusData.status === 'complete' || statusData.status === 'completed') {
                        setIsCompleted(true);
                        onComplete(statusData);

                        // Polling'i durdur
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                    }

                    // If status is failed, call onError and stop polling
                    if (statusData.status === 'failed') {
                        onError(statusData.error || 'Unknown error');

                        // Polling'i durdur
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                    }
                }
            } catch (error) {
                setStatus('error');
                onError(`Status check error: ${error instanceof Error ? error.message : 'Unknown error'}`);

                // Polling'i durdur
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }
    }, [jobId, onComplete, onError]);

    // İşlem tamamlanmadıysa sadece "Generating proof..." mesajını göster
    if (!isCompleted) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-2 items-center text-center">
                    <p className="text-sm font-medium text-[#fe11c5]">Generating proof...</p>
                </div>
            </div>
        );
    }

    // İşlem tamamlandıysa sonuç mesajını göster
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 items-center text-center">
                <p className="text-sm font-medium text-[#fe11c5]">Proof generation completed successfully!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
} 